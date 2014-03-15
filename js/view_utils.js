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
		function create_todolist(data_list) {
				var class_list = ["col-md-1","col-md-1","col-md-1","col-md-1","col-md-1","col-md-1"];
				var html_str = [];
				html_str.push("<div class='container'><div class='col-md-9'><div class='row'>");
				for ( var i = 0 ; i < 2 ; i++) {
						var context = "<div class=" + class_list[i] + ">";
						//context += data_list[i].title;
						context += "test";
						context += "</div>";
						html_str.push(context);
				}
				html_str.push("</div></div></div>");
				return html_str.join("");
		}

		//DBからToDoオブジェクトを全て取得し、TODOリストを表示する
		function view_todolist(selector) {
			var data_list = readAll();
			var todo_html = create_todolist(data_list); 
			$(selector).html(todo_html);
		}
			
		//入力された情報を取得して登録する	
		function extract_todo_info(text_sel,project_sel,duedate_sel) {
			//入力項目を取得する
			var text_val= $(text_sel).val();
			var project_val = $(project_sel).val();
			var duedate_val = $(duedate_sel).val();
			var data = {"title" : title_val, "project" : project_val, "duedate" : duedate_val};
			return data;
		}	

		function regist_todo(event) {
				var data = extract_todo_info(event.data.text_sel, event.data.project_sel, event.data.duedate_sel);
				insertDB(data);
				alert("success register");
		}

		//入力された情報を取得する登録
		view_todolist("#main_todo");
		$("#regist_todo").bind("click",{text_sel : "#title_todo", project_sel : "#project_todo", duedate_sel : "#duedate_todo"},regist_todo);
		//Date入力の設定
		$(".datepicker").datepicker();
		$(".datepicker").datepicker("option","dateFormat",'yy/mm/dd');
		$(".datepicker").datepicker("setDate", new Date());
});
