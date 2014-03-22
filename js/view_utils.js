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
				var html_check = "<div status=" + status + " class='row'><div class='col-md-1'><button name=check data_id=" + id + " class='btn btn-default btn-small " + status + "'><i class='glyphicon glyphicon-unchecked'></i></button></div>";
				var html_title = "<div id=title_" + id + " data_id=" + id + " class='col-md-6'>" + data["title"] + "</div>";
				var html_project = "<div name=project data_id=" + id + " class=col-md-2>" + data["project"] + "</div>";
				var html_duedate = "<div name=duedate data_id=" + id + " class=col-md-1>" + data["duedate"] + "</div>";
				var html_start_button = "<button type=button name=start data_id=" + id + " class='btn btn-info btn-small'><i class='glyphicon glyphicon-play'></i> </button>";
				var html_pause_button = "<button type=button name=pause data_id=" + id + " class='btn btn-info btn-small'><i class='glyphicon glyphicon-pause'></i> </button>";
				var html_delete_button = "<button type=button name=delete data_id=" + id + " class='btn btn-info btn-small'><i class='glyphicon glyphicon-remove-circle'></i> </button>";
				var html_start = "<div class=col-md-2>" + html_start_button + html_pause_button + html_delete_button + "</div></div>";
				var html_todo = html_check + html_title + html_project + html_duedate + html_start;  
				return html_todo;	
		}
		
		//選択されたDOMのステータス更新を行う
		function update_status(before,after) {
				console.log("invoke update_status_view_db");
				var id = $(this).attr("name");
				alert(id);
				//ステータスにより表示形式を変更する。
				var $todo = $("#todo_" + id);
				$todo.removeClass().addClass("btn btn-small done");
				//DBにステータス更新を反映する
				console.log("update db");
		}
		//チェックボックスがチェックされた場合の処理を記述	
		function check_func() {
			//アイコンをチェック済みとする
			var $row = $(this).parent().parent();
			var status_before = $row.attr("status");
			$(this).find("i").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
		    //画面上のステータス更新	
			$row.attr("status","done");
			$(this).removeClass().addClass("btn btn-small done");
			//ボタンの非活性化	
			$row.find("button[name]").attr("disabled", "disabled");
			//DBヘの登録
			var id = parseInt($(this).attr("data_id"),10);
			update(id,"status","done");
		}		
		function start_func() {
			alert("invoke start_func");
		}
		function end_func() {
			alert("invoke start_func");
		}
		function bind_button_event() {
			$("button[name=check]").on('click',check_func);
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
				insertDB(data);
				alert("success register");
		}

		function show_todo_list(selector) {
				//入力された情報を取得する登録
				var content_value = {"selector" : selector};
				var append_todolist_func = append_todolist.bind(content_value);
				readAll(append_todolist_func,bind_button_event);	
		}
		show_todo_list("#main_todo");
		$("#regist_todo").bind("click",{text_sel : "#title_todo", project_sel : "#project_todo", duedate_sel : "#duedate_todo"},regist_todo);
		//Date入力の設定
		$(".datepicker").datepicker();
		$(".datepicker").datepicker("option","dateFormat",'yy/mm/dd');
		$(".datepicker").datepicker("setDate", new Date());
});
