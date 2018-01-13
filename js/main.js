//监听搜索框输入值
var filterInput=ko.observable("");
//地图、信息窗
var amap,hintwindow;
var apiUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&api-key=f7e8a625301e4a5eb74d4f10564eddd3&q=";

//地点相关操作
var place = function(data){
	var self = this;
	this.name=data.name;
	this.coordinate=data.coordinate;
	//地点是否可见
	this.visible = ko.computed(function(){
		var inputname = filterInput();
		return (self.name.indexOf(inputname)>-1);
	});
	//地点标记
	this.marker = new google.maps.Marker({
		position:self.coordinate,
		title:self.name,
		animation:google.maps.Animation.DROP
	});
	
	google.maps.event.addListener(self.marker,"click",function(){
		//打开信息提示窗
		hintwindow.setContent(self.name);
		hintwindow.open(amap,self.marker);
		//显示动画
		if(self.marker.getAnimation()!=null)
			self.marker.setAnimation(null);
		else{
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function(){
				self.marker.setAnimation(null);
			},2000);
		}
		
		$.ajax({
			url:apiUrl+"newyork",
			dataType:"json",
			timeout:5000
		}).done(function(data){
			hintwindow.setContent(data.response.docs[0].snippet);
			hintwindow.open(amap,self.marker);
		}).fail(function(){
			alert("获取详情失败");
		});
	});
}

var viewModel = function(){
	var self = this;
	//初始化地点
	this.placesList =[];
	places.forEach(function(data){
		self.placesList.push(new place(data));
	});
	//标记所有地点
	self.placesList.forEach(function(place){
		place.marker.setMap(amap,place.coordinate);
	});
	//按照搜索输入框筛选
	this.filteredList = ko.computed(function(){
		var result =[];
		self.placesList.forEach(function(place){
			if(place.visible()){
				result.push(place);
				//标记筛选的结果
				place.marker.setMap(amap,place.coordinate);
			}
			else{
				//清除筛掉的结果
				place.marker.setMap(null);
			}
		});
		return result;
	});
	
	this.listClick = function(place){
		google.maps.event.trigger(place.marker,"click");
	};
	
	self.menulisWidth = ko.observable('');
	self.openBtn = function(){
		self.menulisWidth('0');
	}
	self.closeBtn = function(){
		self.menulisWidth('-300px');
	}
};

function init(){
	//加载地图
	amap = new google.maps.Map(document.getElementById('amap'),{center:places[1].coordinate,zoom:12});
	//信息提示窗
	hintwindow = new google.maps.InfoWindow();
	//绑定控件视图
	ko.applyBindings(new viewModel());
}

function getError(){
	alert("脚本加载失败");
}

