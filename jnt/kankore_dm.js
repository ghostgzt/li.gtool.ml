	window.onerror = function(){return true;}
	function comment_add(c,node){
		var c_width=c.length*c_height;
		var c_gd=c_pss[GetRandomNum(0,c_pss.length-1)];
		var c_pss_tmp=[];
		for(var i=0;i<c_pss.length;i++){
			if(c_pss[i]!=c_gd){
				c_pss_tmp.push(c_pss[i]);
			}
		}
		c_pss=c_pss_tmp;
		setTimeout(function(){
		var ks=document.getElementsByClassName('gd'+c_gd);
		if(ks.length){
			var kza=ks[i].innerHTML;
			var kz=(parseInt(kza.length)*c_height)+parseInt(ks[ks.length-1].style.marginLeft)+c_height;
		}else{
			var kz='';
		}
		addels(c,'div',node,'','dm_comment gd'+c_gd,'font-size:'+c_height+'px;margin-top:'+c_gd+'px;margin-left:'+(kz?kz:dm_width)+'px;');
		try{
			eval('clearInterval(cgdser'+c_gd+')');
		}catch(e){}
		eval('cgdser'+c_gd+'='+"setInterval('comment_fn("+c_gd+")',1000)");
		setTimeout(function(){
			if(!c_pss.indexOf(c_gd)){
				c_pss.push(c_gd);
			}
		},parseInt(c_width/100));	
		},GetRandomNum(0,5)*1000);
	}
	function comment_fn(gd){
		var k=document.getElementsByClassName('gd'+gd);
		var scg=0;
		for(var i=0;i<k.length;i++){
			scg+=parseInt(k[i].innerHTML.length)*c_height;
			if(i+1<k.length){
				scg+=(parseInt(k[i+1].innerHTML.length)*c_height-parseInt(k[i].innerHTML.length)*c_height);
			}
		}
		var s=k;
		for(var i=0;i<s.length;i++){
			if(parseInt(s[i].style.marginLeft)>-scg){
				s[i].style.marginLeft=(parseInt(s[i].style.marginLeft)-100)+'px';
			}else{
				s[i].style.marginLeft=parseInt(dm_width)+(parseInt(k[i].innerHTML.length)*c_height)+'px';
			}
		}
	}	
	function comment_dsp(node,fontsize,height,width,maxpage,maxword){
		c_height=fontsize?fontsize:32;
		dm_height=height?height:document.body.scrollHeight;
		dm_width=width?width:document.body.scrollWidth;
		c_psn=parseInt(dm_height/c_height);
		c_pss=[];
		for(var i=0;i<c_psn-1;i++){
			c_pss.push(c_height*i);
		}		
		var cdata=kankore.comment['data'];
		var cmore=kankore.comment['more'];
		var csid=kankore.comment.sid;		
		var wlen=maxword?maxword:20;
		//alert(wlen);
		for(var i=0;i<cdata.length;i++){
			var c=cdata[i]["uname"]+": "+((cdata[i]["cnt"].length>parseInt(wlen))?(cdata[i]["cnt"].substring(0,parseInt(wlen))+'...'):(cdata[i]["cnt"]));
			comment_add(c,node);
		}
		if(cmore&&csid&&(cmore<maxpage||!maxpage)){
			//curl("jnt/kankore.php?sid="+csid+"&page="+cmore,function(result){if(result){eval(result);comment_dsp(node,fontsize,height,width,maxpage,maxword);}});
			kcurl("http://api.uyan.cc/v4/action/?sid="+csid+"&sort=1&pn="+cmore+"&t="+((new Date).getTime()),function(result){if(result){eval("kankore.comment=("+result+");kankore.comment.sid="+csid+";");comment_dsp(node,fontsize,height,width,maxpage,maxword);}});
		}		
	}
	function comment_load(node,fontsize,height,width,maxpage,maxword,style,url){
		style=style?style:'white-space:nowrap;position:absolute;z-index:1;color:white;-webkit-transition: margin-left 0.5s;-moz-transition: margin-left 0.5s;-ms-transition: margin-left 0.5s;text-shadow: 0px 0px 3px rgba(0, 0, 0, 1);font-family: Microsoft YaHei;';
		addels('.dm_comment{'+style+'}','style',node);
		//curl("jnt/kankore.php"+(url?('?url='+encodeURIComponent(url)):''),function(result){if(result){eval(result);comment_dsp(node,fontsize,height,width,maxpage,maxword);}});
		if(!url){
			kcurl("http://api.uyan.cc/v4/action/?sid=8509656&t="+((new Date).getTime()),function(result){if(result){eval("kankore.comment=("+result+");kankore.comment.sid=8509656;");comment_dsp(node,fontsize,height,width,maxpage,maxword);}});
		}else{
			kcurl(url,function(result){
				var zz=/\"sid\"\:(.*?)\,/i;
				var ss=zz.exec(result);
				var sid=ss[1];
				var dd=/UYAN_RENDER.comment\((.*?)\)\;/i;
				var rr=dd.exec(result);	
				var data=rr[1];
				if(parseInt(sid)){
					//alert(sid);
					eval("kankore.comment=("+data+");kankore.comment.sid="+sid+";");
					comment_dsp(node,fontsize,height,width,maxpage,maxword);
				}else{
					kcurl("http://api.uyan.cc/v4/action/?sid=7&t="+((new Date).getTime()),function(result){
					if(result){
						//alert(result);
						eval("kankore.comment=("+result+");kankore.comment.sid=7;");
						comment_dsp(node,fontsize,height,width,maxpage,maxword);
					}
					});
				}
			}
			);
		}
	}
	function kcurl(url,code,method,data,interval){
		setTimeout(function(){AjaxCrossDomainRequest(url, method?method:'GET', data?data:'',code);},interval?interval:2000);
	}
	AjaxCrossFlashFile="jnt/ajaxcdr.swf";
	document.write('<script type="text/javascript" src="jnt/ajaxcdr.js"></scr'+'ipt>');	
	var kankore=kankore?kankore:{};
	var addels=addels?addels:parent.addels;
	var GetRandomNum=GetRandomNum?GetRandomNum:parent.GetRandomNum;