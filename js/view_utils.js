jQuery(function($) {
		$('.selectpicker').selectpicker();
		//TODOリストのDOMを作成
		//項目は以下6項目
		//注意：ボタンのイベントは未登録（全て登録後に最後にバインドする)
		//1.チェックボタン
		//2.テキスト項目&プロジェクト項目（TODO内容を記述）
		//4.期限（いつやるか）
		//5.依頼者
		//6.時間計測ボタン群
		function create_todolist_element (data) {
				var id = data["id"];
				var status = data["status"];
				var html_row = "<div status=" + status + " class='row'>";
				var disabled_attr = "";
				if (status === "done" || status === "discarded") {
						disabled_attr = "disabled=disabled";
				}
				var check_icon = "glyphicon-unchecked";
				if (status === "done") {
						check_icon = "glyphicon-check";
				}
				var start_pause_icon = "glyphicon glyphicon-play";
				if (status === "doing") {
						start_pause_icon = "glyphicon glyphicon-pause";
				}
				var html_check = "<div class='col-md-1'><button name=check data_id=" + id + " class='btn btn-small " + status + "' " + disabled_attr + "><i class='glyphicon " + check_icon + "'></i></button></div>";
				console.log("disabled FLG is " + html_check);
				var html_title = "<div id=title_" + id + " data_id=" + id + " class='col-md-6'>" + data["title"] + "</div>";
				var html_project = "<div name=project data_id=" + id + " class=col-md-2>" + data["project"] + "</div>";
				var html_duedate = "<div name=duedate data_id=" + id + " class=col-md-1>" + data["duedate"] + "</div>";
				var html_start_button = "<button type=button name=start data_id=" + id + " class='btn btn-small btn-default'" + disabled_attr + "><i class='" + start_pause_icon + "'></i> </button>";
				var html_delete_button = "<button type=button name=delete data_id=" + id + " class='btn btn-small btn-default'" + disabled_attr + "><i class='glyphicon glyphicon-remove-circle'></i> </button>";
				var html_start = "<div class=col-md-2>" + html_start_button + html_delete_button + "</div></div>";
				var html_todo = html_row + html_check + html_title + html_project + html_duedate + html_start;  
				return html_todo;	
		}
		
		//チェックボックスがチェックされた場合の処理を記述	
		function check_func() {
			console.log("check_func");
			//アイコンをチェック済みとする
			var $row = $(this).parent().parent();
			var current_status = $row.attr("status");
			$(this).find("i").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
		    //画面上のステータス更新	
			$row.attr("status","done");
			$(this).removeClass().addClass("btn btn-small done");
			//ボタンの非活性化	
			$row.find("button[name]").attr("disabled", "disabled");
			//DBヘの登録
			var id = parseInt($(this).attr("data_id"),10);
			update(id,"status","done");
			if(current_status === "doing") {
				update(id,"endtime", new Date());
			} else if (current_status === "waiting" || current_status === "undone") {
				update(id,"starttime", new Date());
				update(id,"endtime", new Date());
			}
		}		

		//スタートボタン押した場合の挙動
		function start_func() {
			console.log("invoke start_func");
			var $row = $(this).parent().parent();
		    //画面上のステータス更新	
			$row.attr("status","doing");
			$row.find("button[name=check]").removeClass().addClass("btn btn-small doing");
			//DBヘの登録
			var id = parseInt($(this).attr("data_id"),10);
			update(id,"status","doing");
			
			$(this).find("i").removeClass("glyphicon-play").addClass("glyphicon-pause");
			$(this).off('click',start_func);
			$(this).on('click',pause_func);

			//update処理(スタートボタンの更新）
			var id = parseInt($(this).attr("data_id"),10);
			update(id,"starttime",new Date(),"array");
		}


		//ストップボタン押した場合の処理
		function pause_func() {
			console.log("invoke pause_func");
			var $row = $(this).parent().parent();
			var status_before = $row.attr("status");
		    //画面上のステータス更新	
			$row.attr("status","waiting");
			$row.find("button[name=check]").removeClass().addClass("btn btn-small waiting");
			
			//update処理(スタートボタンの更新）
			var id = parseInt($(this).attr("data_id"),10);
			update(id,"status", "waiting");
			update(id,"endtime",new Date(),"array");
			//スタートボタンの設定
			$(this).find("i").addClass("glyphicon-play").removeClass("glyphicon-pause");
			$(this).off('click',pause_func);
			$(this).on('click',start_func);
		}
		

		//削除
		function delete_func() {
			var $row = $(this).parent().parent();
			var status_before = $row.attr("status");
			$row.attr("status","discarded");
			$check = $row.find("button[name=check]");
			//ボタンの非活性化	
			$check.removeClass().addClass("btn btn-small discarded");
			$row.find("button[name]").attr("disabled", "disabled");
			//DBヘの登録
			var id = parseInt($(this).attr("data_id"),10);
			update(id,"status","discarded");
		}

		//ボタンへのバインド処理
		function bind_button_event() {
			$("button[name=check]").on('click',check_func);
			$("button[name=start]").on('click',start_func);
			$("button[name=delete]").on('click',delete_func);
		}
		
		//TODOリスト全体を表示するロジック
		function create_todolist(data) {
				var html_str = [];
				var html_str_test = create_todolist_element(data);
				return html_str_test;
		}

		//DBからToDoオブジェクトを全て取得し、TODOリストを表示する
		function append_todolist(data_list) {
			var todo_html = create_todolist(data_list);
			$(this.selector).append(todo_html);
		}
			
		//入力された情報を取得して登録する
		//TextAreaに入力された先頭行はtitleとして入力	
		function extract_todo_info(text_sel,project_sel,duedate_sel) {
			//入力項目を取得する
			var text_val= $(text_sel).val();
			var project_val = $(project_sel).val();
			var duedate_val = $(duedate_sel).val();
			var text_result = text_val.split(/[\r]|[\n]|[\r\n]/);
			var title_index = text_val.match(/[\r]|[\n]|[\r\n]/);
			var title_val = text_result[0];
			var comment_val = "";
			if(title_index) {
					comment_val= text_val.substring(title_index.index + 1);
			}
			var data = {"title" : title_val, "comment" : comment_val, "project" : project_val, "duedate" : duedate_val, "status" : "undone"};
			return data;
		}	

		function regist_todo(event) {
				var data = extract_todo_info(event.data.text_sel, event.data.project_sel, event.data.duedate_sel);
				var content_value = "#main_todo";
				var read_func = show_todo_list.bind(null, content_value);
				insertDB(data,read_func);
		}

		function show_todo_list(selector) {
				//入力された情報を取得する登録
				var content_value = {"selector" : selector};
				var append_todolist_func = append_todolist.bind(content_value);
				readAll(append_todolist_func,bind_button_event);	
		}
		//初期表示
		show_todo_list("#main_todo");
		$("#regist_todo").bind("click",{text_sel : "#title_todo", project_sel : "#project_todo", duedate_sel : "#duedate_todo"},regist_todo);

		//Date入力の設定
		$(".datepicker").datepicker();
		$(".datepicker").datepicker("option","dateFormat",'yy/mm/dd');
		$(".datepicker").datepicker("setDate", new Date());
});
