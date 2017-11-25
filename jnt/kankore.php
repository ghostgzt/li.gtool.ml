<?php
error_reporting(0);
$b="http://api.uyan.cc/v4/action/?sid=7&t=".time();
$u=@$_GET['url'];
$sid=@$_GET['sid'];
$page=@$_GET['page'];
if($sid){
	if(!$page){$page=0;}
	$s="http://api.uyan.cc/v4/action/?sid=$sid&sort=1&pn=$page&t=".time();
	$out=file_get_contents($s);
	if(!$out){$out='{"data":[],"more":0,"way":0}';}
	die('kankore.comment=('.$out.');kankore.comment.sid='.$sid.';');	
}
if(!$u){
	$s="http://api.uyan.cc/v4/action/?sid=8509656&t=".time();
	$out=file_get_contents($s);
	if(!$out){$out='{"data":[],"more":0,"way":0}';}
	die('kankore.comment=('.$out.');kankore.comment.sid=8509656;');
}else{
	$s=urldecode($u);
}
function getcomment($s){
	$r=file_get_contents($s);
	preg_match_all('/UYAN_RENDER.comment\(\{(.*?)\}\)\;/is',$r,$o);
	$out=$o[1][0];
	return $out;
}
function getsid($s){
	$r=file_get_contents($s);
	preg_match_all('/\"sid\"\:(.*?)\,/is',$r,$o);
	$out=$o[1][0];
	return $out;
}
$out=getcomment($s);
if($out&&substr($out,0,strlen('"data":[]'))!='"data":[]'){
	die('kankore.comment=({'.$out.'});kankore.comment.sid='.getsid($s).';');
}else{
	$out=file_get_contents($b);
	if(!$out){$out='{"data":[],"more":0,"way":0}';}
	die('kankore.comment=('.$out.');kankore.comment.sid=7;');
}
