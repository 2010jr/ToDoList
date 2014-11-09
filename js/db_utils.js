var IndexedDB = (function () {

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
						apply_func(f,db);
				} else if(db.version > 2) {
						deleteDB();
				} else initDB(f);
				console.log("finish withDB");
		};
}

//DB挿入。挿入後の処理をfuncに指定
function insertDB(data,func) {
		alert("invoke insert");
		withDB(function(db) {
				alert("invoke insert function");
				var transaction = db.transaction(DB_NAME,"readwrite"),
				store = transaction.objectStore(DB_NAME),
				request = store.add({
						"createdate" : new Date().getTime(),
				"project" : data['project'],
				"title" : data['title'],
				"duedate" : data['duedate'],
				"status" : data['status']
				});
		request.onsuccess = function(e) {
				console.log("succeed to create");
				apply_func(func);
		};
		request.onerror = logerror;
		});
}


//キーと更新するプロパティとそのバリューを指定して更新する（一つのプロパティの更新を行う）
//オプションとして単一オブジェクトの更新or配列の更新（要素の追加）が指定が可能
//デフォルトは単一オブジェクトの更新
function update(key,property,value,single_or_array) {
		console.log("invoke update");
		withDB(function(db) {
				var store = db.transaction(DB_NAME,"readwrite").objectStore(DB_NAME);
				var request_get = store.get(key);

				request_get.onsuccess = function (e_get) {
						var data = e_get.target.result,
				request_put;
		if(typeof data !== "undefined") {
				if(typeof single_or_array === "undefined" || single_or_array === "single") {
						data[property] = value;
				} else if (single_or_array === "array") {
						//初期設定の場合
						if(typeof data[property] === "undefined") {
								data[property] = [value];
						} else {
								data[property].push(value);
						}
				}
		} else {
				alert("data is not found");
				return;
		}
		request_put = store.put(data);
		request_put.onsuccess = function (e_put) {
				console.log("update data");
		};
		request_put.error = logerror;
				};
				request_get.onerror = logerror;
		});
}

//全てのオブジェクトを読み込み表示する
function readAll(func, func_end) {
		console.log("invoked readAll");
		var data_list = [];
		withDB(function(db) {
				var transaction = db.transaction(DB_NAME),
				store = transaction.objectStore(DB_NAME),
				request = store.openCursor();

		request.onsuccess = function(e) {
				var cursor = e.target.result,
				data;
		if (cursor) {
				data = apply_to_result(cursor,func);
				data_list.push(data);
		} else {
				//カーソル全て終わった後の処理
				apply_func(func_end,data_list);
		}
		};
		});
}

//あるIndexの値に一致する項目のみ取得する
function readByIndex(search_index,search_value,func,func_end) {
		console.log("invoke readByIndex");
		var data_list = [];
		withDB(function(db) {
				var range = IDBKeyRange.only(search_value),
				transaction = db.transaction(DB_NAME),
				store = transaction.objectStore(DB_NAME),
				index = store.index(search_index),
				request = index.openCursor(range);

		request.onsuccess = function(e) {
				var cursor = e.target.result,
				data;
		if (cursor) {
				data = apply_to_result(cursor,func);
				data_list.push(data);
		} else {
				//カーソル全て終わった後の処理
				apply_func(func_end,data_list);
		}
		};
		});
}
//ある範囲を検索
function readByRange(search_index,search_value_from,search_value_to,lowerOpen,upperOpen,func,func_end) {
		console.log("invoke readByRange");
		var data_list = [];
		withDB(function(db) {
				var range,
				store = db.transaction(DB_NAME).objectStore(DB_NAME),
				index = store.index(search_index),
				request = index.openCursor(range);

		if(typeof search_value_to === "undefined" || search_value_to === null) {
				range = IDBKeyRange.upperBound(search_value_to,lowerOpen);
		} else if(typeof search_value_from === "undefined" || search_value_from === null) {
				range = IDBKeyRange.lowerBound(search_value_from,upperOpen);
		} else {
				range = IDBKeyRange.bound(search_value_from, search_value_to);
		}


		request.onsuccess = function (e) {
				var cursor = e.target.result,
				data;

		if (cursor) {
				data = apply_to_result(cursor,func);
				data_list.push(data);
		} else {
				//カーソル全て終わった後の処理
				apply_func(func_end,data_list);
		}
		};
		});
}	

//検索
function apply_to_result(cursor,func) {
		var data = cursor.value;
		apply_func(func,data);
		cursor.continue();
		return data;
}


function printConsole(data) {
		var jsonStr;
		if (data instanceof Array) {
				for(var i = 0 , max = data.length ; i < max ; i++) {
						jsonStr = JSON.stringify(data[i]);
						console.log(jsonStr);
				}
		} else {
				jsonStr = JSON.stringify(data);
				console.log(jsonStr);
		}
}

function deleteObject(id) {
		console.log("invoke deleteObject");
		withDB(function(db) {
				var transaction = db.transaction(DB_NAME),
				store = transaction.objectStore(DB_NAME),
				request = store.delete(id);

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
		var request = indexedDB.open(DB_NAME, 2);
		console.log("invoke initDB");
		request.onerror = logerror;
		request.onsuccess = function() {
				withDB(f);
				console.log("succeed " + DB_NAME + " initDB");
		}
		request.onupgradeneeded = function(e) {
				var db = e.target.result,
					store = db.createObjectStore(DB_NAME,
									{keyPath: "id", autoIncrement:true});
				for(var i = 0,max = INDEX_KEY.length ; i < max ; i++) {
						store.createIndex(INDEX_KEY[i][0],INDEX_KEY[i][1]);
						console.log(INDEX_KEY[i][0] + " create Index");
				}
		};
}

//関数かどうか判定してから関数を実行する
//funcが間数でない場合、undefinedを返す
function apply_func(func,args) {
		var result;
		if (typeof func === "function") {
				if (typeof args === "undefined") {
						result = func();
				} else {
						result = func(args);
				}
		} 
		return result;
}
	return {
			initDB : initDB,
			deleteObject : deleteObject,
			deleteDB: deleteDB,
			readByRange : readByRange,
			readByIndex : readByIndex,
			readAll : readAll,
			update : update,
			insertDB : insertDB,
			withDB : withDB				
		};
}) ();

