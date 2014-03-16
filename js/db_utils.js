var indexedDB = window.indexedDB ||
	window.mozIndexedDB ||
	window.webkitIndexedDB;

var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

//DBに関する設定値
var DB_NAME = "todolist";
var INDEX_KEY = [["Name","name"],
				 ["Tag","tag"],
				 ["Project","project"],
				 ["Status","status"],
				 ["StartTime","startime"],
				 ["EndTime","endtime"],
				 ["DueTime","duetime"]];

function logerror(e) {
		alert("IndexedDB error " + e.code + " : " + e.message);
}

function withDB(f) {
		console.log("invoke withDB");
		var request = indexedDB.open(DB_NAME);
		request.onerror = logerror;
		request.onsuccess = function() {
				var db = request.result;
				console.log("DB version : " + db.version);
				if (db.version === 2) {
					if ( typeof f !== "undefined") {
						f(db);
					}
				} else if(db.version > 2) {
						deleteDB();
				} else initDB(f);
				console.log("finish withDB");
		};
}

function insertDB(data) {
		alert("invoke insert");
		withDB(function(db) {
				alert("invoke insert function");
				var transaction = db.transaction(DB_NAME,"readwrite");
				var store = transaction.objectStore(DB_NAME);
				var request = store.add({
						"createdate" : new Date().getTime(),
						"project" : data["project"],
				   		"title" : data["title"]	
				});
				request.onsuccess = function(e) {
						console.log("succeed to create");
				};
				request.onerror = logerror;
		});
}

function update(key,property,value) {
		console.log("invoke update");
		withDB(function(db) {
				var store = db.transaction(DB_NAME,"readwrite").objectStore(DB_NAME);
				var request_get = store.get(key);

				request_get.onsuccess = function (e_get) {
						var data = e_get.target.result;
						if(typeof data !== "undefined") {
								data[property] = value;
						} else {
								alert("data is not found");
								return;
						}
						var request_put = store.put(data);
						request_put.onsuccess = function (e_put) {
								console.log("update data");
						}
						request_put.error = logerror;
				}
				request_get.onerror = logerror;
		});
}

//全てのオブジェクトを読み込み表示する
function readAll(func) {
		console.log("invoked readAll");
		withDB(function(db) {
				var transaction = db.transaction(DB_NAME);
				var store = transaction.objectStore(DB_NAME);

				var request = store.openCursor();
				request.onsuccess = function(e) {
						var cursor = e.target.result;
						var data = apply_to_result(cursor,func);
				};
		});
}

//あるIndexの値に一致する項目のみ取得する
function readByIndex(search_index,search_value,func) {
	console.log("invoke readByIndex");
	withDB(function(db) {
			var range = IDBKeyRange.only(search_value);

			var transaction = db.transaction(DB_NAME);
		    var store = transaction.objectStore(DB_NAME);
			var index = store.index(search_index);

			var request = index.openCursor(range);
			request.onsuccess = function(e) {
					var cursor = e.target.result;
					var data = apply_to_result(cursor,func);
			};
	});
}
//ある範囲を検索
function readByRange(search_index,search_value_from,search_value_to,lowerOpen,upperOpen,func) {
		console.log("invoke readByRange");
		withDB(function(db) {
				var range;
				if(typeof search_value_to === "undefined" || search_value_to === null) {
						range = IDBKeyRange.upperBound(search_value_to,lowerOpen);
				} else if(typeof search_value_from === "undefined" || search_value_from === null) {
						range = IDBKeyRange.lowerBound(search_value_from,upperOpen);
				} else {
						range = IDBKeyRange.bound(search_value_from, search_value_to);
				}

				var store = db.transaction(DB_NAME).objectStore(DB_NAME);
				var index = store.index(search_index);

				var request = index.openCursor(range);

				request.onsuccess = function (e) {
						var cursor = e.target.result;
						var data_list = apply_to_result(cursor,func);
				};
		});
}	

//検索
function apply_to_result(cursor,func) {
	if (cursor) {
		data = cursor.value;
		if (typeof func !== "undefined") {
				func(data);	
		}
		cursor.continue();
	}
}

function printConsole(data) {
	if (data instanceof Array) {
		for(var i = 0 ; i < data.length ; i++) {
			var jsonStr = JSON.stringify(data[i]);
			console.log(jsonStr);
		}
	} else {
			var jsonStr = JSON.stringify(data);
			console.log(jsonStr);
	}
}

function deleteObject(id) {
		console.log("invoke deleteObject");
		withDB(function(db) {
			var transaction = db.transaction(DB_NAME);
			var store = transaction.objectStore(DB_NAME);

			var request = store.delete(id);
			request.onsuccess = function(e) {
				console.log("delete object Success!! id: " + id);
			};
			
			request.onerror = logerror;
		});
}	

function deleteDB() {
		var request = indexedDB.deleteDatabase(DB_NAME);
		request.onsuccess = function (e) {
				alert("database " + DB_NAME + " deleted successfully");
		};
		request.onerror = logerror;
}


//DB、オブジェクトストア初期化メソッド
function initDB(f) {
		console.log("invoke initDB");
		var request = indexedDB.open(DB_NAME, 2);
		request.onerror = logerror;
		request.onsuccess = function() {
				var db = request.result;
				withDB(f);
				console.log("succeed " + DB_NAME + " initDB");
		}
		request.onupgradeneeded = function(e) {
				var db = e.target.result;
				var store = db.createObjectStore(DB_NAME,
								{keyPath: "id", autoIncrement:true});
				for(var i = 0 ; i < INDEX_KEY.length ; i++) {
						store.createIndex(INDEX_KEY[i][0],INDEX_KEY[i][1]);
						console.log(INDEX_KEY[i][0] + " create Index");
				}
		};
}
