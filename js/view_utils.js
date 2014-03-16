jQuery(function($) {
		$('.selectpicker').selectpicker();
		//TODOリストのDOM<tr>を作成
		//項目は6項目
		//1.チェックボタン
		//2.テキスト項目&プロジェクト項目（TODO内容を記述）
		//4.期限（いつやるか）
		//5.依頼者
		//6.時間計測ボタン群
		function create_todo_list (data) {
				var element_list = [];
				var $check_button = $('<button/>', {
						value: "check",
					click: update(data["id"],"status","DONE")
				}).wrapInner("<td/>");
				var $title = $('<div/>', {
						text:data["title"]
				}).wrapInner("<td/>");
				var $project = $('<div/>', {
						text:data["project"]
				}).wrapInner("<td/>");
				var $duedate = $('<div/>', {
						text:data["duedate"]
				}).wrapInner("<td/>");
				var $button_start =  $('<button/>',{
						value: start,
					click: function() {alert("start");}
				}).wrapInner("<td/>");
				//各要素の結合
				return	$check_button.append($title).append($project).append($duedate).append($button_start).wrapInner("<tr/>");		
		}
		
		//TODOリスト全体を表示するロジック
		function create_todolist(data) {
				var html_str = [];
				html_str.push("<div class='col-md-9'><div class='row'>");
				html_str.push(data["title"]);
				html_str.push("</div></div>");
				return html_str.join("");
		}

		//DBからToDoオブジェクトを全て取得し、TODOリストを表示する
		function view_todolist(data_list) {
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
			var comment_val= text_val.substring(title_index.index + 1);
			var data = {"title" : title_val, "comment" : comment_val, "project" : project_val, "duedate" : duedate_val};
			return data;
		}	

		function regist_todo(event) {
				var data = extract_todo_info(event.data.text_sel, event.data.project_sel, event.data.duedate_sel);
				insertDB(data);
				alert("success register");
		}

		//入力された情報を取得する登録
		var content_value = { selector : "#main_todo"};
		var content_show_func = view_todolist.bind(content_value);
	    readAll(content_show_func);	
		$("#regist_todo").bind("click",{text_sel : "#title_todo", project_sel : "#project_todo", duedate_sel : "#duedate_todo"},regist_todo);
		//Date入力の設定
		$(".datepicker").datepicker();
		$(".datepicker").datepicker("option","dateFormat",'yy/mm/dd');
		$(".datepicker").datepicker("setDate", new Date());
});
