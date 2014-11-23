jQuery(function($) {

		function create_gantt(data_list) {
				var w = 1000,
					h = 500,
					padding = 100,
					svg,
					xScale,
					yScale,
					xAxis,
					yAxis,
					rect_radius = 10,
					rect_data;


				svg = d3.select("body")
						.append("svg")
						.attr("width", w)
						.attr("height", h);

				xScale = d3.time.scale()
						.domain([d3.time.day.offset(new Date(), -3),d3.time.day.offset(new Date(), 3)])
						.range([padding,w - padding * 2])
						.nice(d3.time.day);

				yScale = d3.scale.ordinal().domain(["CbD","OSS","Work"]).rangeRoundBands([h - padding,padding], 0.2);
				xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(d3.time.days,1).tickFormat(d3.time.format("%m/%d"));
				yAxis = d3.svg.axis().scale(yScale).orient("left");
				rect_radius = 10;
				rect_data = svg.selectAll("rect")
						.data(data_list.filter(function(d) { return xScale.domain()[0] <= d.duedate && xScale.domain()[1] >= d.duedate;}))
						.enter().append("rect")
						.attr("class", function(d) { return "status_" + d.status;})
						.attr("x", function(d){ return xScale(d.duedate);})
						.attr("y", function(d) { return yScale.range()[yScale.domain().indexOf(d.project)];})
						.attr("rx", rect_radius)
						.attr("ry", rect_radius) 
						.attr("width", 50)
						.attr("height", yScale.rangeBand());
				svg.selectAll("text")
						.data(data_list.filter(function(d) { return xScale.domain()[0] <= d.duedate && xScale.domain()[1] >= d.duedate;}))
						.enter()
						.append("text")
						.attr("class", "todo")
						.text(function(d) { return d.title;})
						.attr("x" , function(d) { return xScale(d.duedate) + 5;})
						.attr("y", function(d) { return yScale.rangeBand()/2 + yScale.range()[yScale.domain().indexOf(d.project)];});

				svg.append("g")
						.attr("class", "axis xaxis")
						.attr("transform", "translate(0," + (h - padding) + ")")
						.call(xAxis);


				svg.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(" + padding + ",0)")
						.call(yAxis);
				//軸移動
				function slide_x_axis(offset,data_list) {
						var time_domain_old = xScale.domain();
						var time_domain_new = [d3.time.day.offset(time_domain_old[0], offset), d3.time.day.offset(time_domain_old[1], offset)];
						xScale.domain(time_domain_new);
						svg.select(".xaxis").call(xAxis);
						//削除
						svg.selectAll("rect")
								.data(data_list.filter(function(d){ return xScale.domain()[0] <= d.duedate && xScale.domain()[1] >= d.duedate;}))
								.exit().remove();
						svg.selectAll(".todo")
								.data(data_list.filter(function(d){ return xScale.domain()[0] <= d.duedate && xScale.domain()[1] >= d.duedate;}))
								.exit().remove();
						//更新
						svg.selectAll("rect")
								.data(data_list.filter(function(d) { return xScale.domain()[0] <= d.duedate && xScale.domain()[1] >= d.duedate;}))
								.enter().append("rect")
								.attr("class", function(d) { return "status_" + d.status;})
								.attr("x", function(d){ return xScale(d.duedate);})
								.attr("y", function(d) { return yScale.range()[yScale.domain().indexOf(d.project)];})
								.attr("rx", rect_radius)
								.attr("ry", rect_radius) 
								.attr("width", 50)
								.attr("height", yScale.rangeBand());
						svg.selectAll(".todo")
								.data(data_list.filter(function(d) { return xScale.domain()[0] <= d.duedate && xScale.domain()[1] >= d.duedate;}))
								.enter()
								.append("text")
								.attr("class", "todo")
								.text(function(d) { return d.title;})
								.attr("x" , function(d) { return xScale(d.duedate) + 5;})
								.attr("y", function(d) { return yScale.rangeBand()/2 + yScale.range()[yScale.domain().indexOf(d.project)];});
				}

				svg.append("text")
						.attr("width", 10)
						.attr("height", 10)
						.attr("x", xScale.range()[0] - 40)
						.attr("y", h - padding + 15)
						.text("<<")
						.on("click",function() {slide_x_axis(-7,data_list);});

				svg.append("text")
						.attr("width", 10)
						.attr("height", 10)
						.attr("x", xScale.range()[1] + 40)
						.attr("y", h - padding + 15)
						.text(">>")
						.on("click",function() {slide_x_axis(7,data_list)});
		}

		var todoDB = new IndexedDB({ 
				dbName : "todolist", 
				keyPath : "id" , 
				isAutoInc : true, 
				indexs : ['id','status','project','duedate']
			});
		todoDB.readAll(null,create_gantt);
});
