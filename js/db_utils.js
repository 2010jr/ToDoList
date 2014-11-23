var IndexedDB = (function () {
	"use strict";
	//ブラウザ関連の変数
	var indexedDB = window.indexedDB ||
		window.mozIndexedDB ||
		window.webkitIndexedDB,
		IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
	
	//DBに関する設定値(不変)
	var dbName, 
		keyName,
		isAutoInc,
		indexs;

	var Constructor;

	//パラメータの設定
	Constructor = function(dbParams) {
		dbName = dbParams.dbName;
		keyName = dbParams.keyPath || "id";
	    isAutoInc = dbParams.isAutoInc || true;
		indexs = dbParams.indexs;	
	};

	//1回きりの初期化処理
	initDB();	

	//プロトタイプ
	Constructor.prototype = {
			deleteObject : deleteObject,
			deleteDB: deleteDB,
			readByRange : readByRange,
			readByIndex : readByIndex,
			readAll : readAll,
			update : update,
			insert : insert
	};

	
	//プライベートのメソッド
	function logerror(e) {
			alert("IndexedDB error " + e.code + " : " + e.message);
	}

	function withDB(callbackFunc) {
			console.log("invoke withDB");
			var request = indexedDB.open(dbName);
			request.onerror = logerror;
			request.onsuccess = function() {
					var db = request.result;
					console.log("DB version : " + db.version);
					if (db.version === 2) {
							apply_func(callbackFunc,db);
					} else if(db.version > 2) {
							deleteDB();
					} else initDB(callbackFunc);
					console.log("finish withDB");
			};
	}

	//オブジェクト挿入。挿入後の処理をfuncに指定
	function insert(data,callbackFunc) {
			console.log("invoke insert");
			withDB(function(db) {
					alert("invoke insert function");
					var transaction = db.transaction(dbName,"readwrite"),
						store = transaction.objectStore(dbName),
						request = store.add(data);

					request.onsuccess = function() {
						console.log("succeed to create");
						apply_func(callbackFunc);
					};
					request.onerror = logerror;
			});
	}


	//キーと更新するプロパティとそのバリューを指定して更新する（一つのプロパティの更新を行う）
	//オプションとして単一オブジェクトの更新or配列の更新（要素の追加）が指定が可能
	//デフォルトは単一オブジェクトの更新
	function update(key,property,value) {
			console.log("invoke update");
			withDB(function(db) {
					var store = db.transaction(dbName,"readwrite").objectStore(dbName);
					var request_get = store.get(key);
					
					//データ取得後に更新処理を実行する
					request_get.onsuccess = function (e_get) {
							var data = e_get.target.result,
								request_put;
							//取得したデータの設定処理
							if(typeof data !== "undefined") {
								data[property] = value;
							} else {
								alert("data is not found");
								return;
							}

							//データの格納処理
							request_put = store.put(data);
							request_put.onsuccess = function () {
								console.log("update data");
							};
							request_put.error = logerror;
							request_get.onerror = logerror;
						};
			});
	}

	//全てのオブジェクトを読み込み表示する
	function readAll(callBackFunc, callBackFuncLast) {
			console.log("invoked readAll");
			var data_list = [];
			withDB(function(db) {
					var transaction = db.transaction(dbName),
						store = transaction.objectStore(dbName),
						request = store.openCursor();

					request.onsuccess = function(e) {
						var cursor = e.target.result,
							data;
						if (cursor) {
							data = apply_to_result(cursor,callBackFunc);
							data_list.push(data);
						} else {
							//カーソル全て終わった後の処理
							apply_func(callBackFuncLast,data_list);
						}
					};
			});
	}

	//あるIndexの値に一致する項目のみ取得する
	function readByIndex(tIndex,tValue,callbackFunc,callbackFuncLast) {
			console.log("invoke readByIndex");
			var data_list = [];
			withDB(function(db) {
					var range = IDBKeyRange.only(tValue),
					transaction = db.transaction(dbName),
					store = transaction.objectStore(dbName),
					index = store.index(tIndex),
					request = index.openCursor(range);

					request.onsuccess = function(e) {
						var cursor = e.target.result,
							data;
					if (cursor) {
						data = apply_to_result(cursor,callbackFunc);
						data_list.push(data);
					} else {
						//カーソル全て終わった後の処理
						apply_func(callbackFuncLast,data_list);
					}
					};
			});
	}

	//ある範囲を検索
	function readByRange(tIndex,tValueFrom,tValueTo,lowerOpen,upperOpen,callbackFunc,callbackFuncLast) {
			console.log("invoke readByRange");
			var data_list = [];
			withDB(function(db) {
					var range,
					store = db.transaction(dbName).objectStore(dbName),
					index = store.index(tIndex),
					request = index.openCursor(range);

					if(typeof tValueTo === "undefined" || tValueTo === null) {
						range = IDBKeyRange.upperBound(tValueTo,lowerOpen);
					} else if(typeof tValueFrom === "undefined" || tValueFrom === null) {
						range = IDBKeyRange.lowerBound(tValueFrom,upperOpen);
					} else {
						range = IDBKeyRange.bound(tValueFrom, tValueTo);
					}


					request.onsuccess = function (e) {
						var cursor = e.target.result,
							data;

						if (cursor) {
							data = apply_to_result(cursor,callbackFunc);
							data_list.push(data);
						} else {
								//カーソル全て終わった後の処理
								apply_func(callbackFuncLast, data_list);
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

	function deleteObject(keyValue) {
			console.log("invoke deleteObject");
			withDB(function(db) {
					var transaction = db.transaction(dbName),
					store = transaction.objectStore(dbName),
					request = store.delete(keyValue);

					request.onsuccess = function() {
						console.log("delete object Success!! keyValue: " + keyValue);
					};

					request.onerror = logerror;
			});
	}	

	function deleteDB() {
			var request = indexedDB.deleteDatabase(dbName);
			request.onsuccess = function () {
					alert("database " + dbName + " deleted successfully");
			};
			request.onerror = logerror;
	}


	//DB、オブジェクトストア初期化メソッド
	function initDB(f) {
			var request = indexedDB.open(dbName, 2);
			console.log("invoke initDB");
			request.onerror = logerror;
			request.onsuccess = function() {
					withDB(f);
					console.log("succeed " + dbName + " initDB");
			};
			request.onupgradeneeded = function(e) {
					var db = e.target.result,
						store = db.createObjectStore(dbName,
										{keyPath: keyName, autoIncrement:isAutoInc});

					for(var i = 0,max = indexs.length ; i < max ; i++) {
							store.createIndex(indexs[i],indexs[i]);
							console.log(indexs[i] + " create Index");
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
	return Constructor;
}());

