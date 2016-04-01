var successResponses = {};

successResponses.statsClicks = {"code":200,"headers":[{"name":"Content-Type","value":"application\/json"}],"body":{"date":"2014-09-12","days":{"2014-09-12":{"clicks":[{"icon":null,"url":"http:\/\/example.com\/","name":"example.com","views":126,"children":null},{"icon":null,"url":"http:\/\/example.com\/","name":"example.com","views":64,"children":null},{"icon":null,"url":null,"name":"example.org","views":60,"children":[{"url":"http:\/\/example.org\/","name":"example.org","views":57},{"url":"http:\/\/example.org\/notarealaddress-t\/","name":"example.org\/2014\/08\/26\/notarealaddress\/","views":2},{"url":"http:\/\/example.org\/notarealaddress","name":"example.org\/notarealaddress\/","views":1}]},{"icon":null,"url":"http:\/\/example.com\/","name":"example.com","views":50,"children":null},{"icon":null,"url":null,"name":"example.com","views":46,"children":[{"url":"https:\/\/example.com\/","name":"notarealaddress","views":45},{"url":"https:\/\/example.com\/","name":"example.com","views":1}]},{"icon":null,"url":"http:\/\/example.com\/","name":"example.com","views":39,"children":null},{"icon":"https:\/\/example.com\/","url":null,"name":"example.com","views":35,"children":[{"url":"http:\/\/example.com\/","name":"example.com","views":34},{"url":"http:\/\/www.example.com\/","name":"example.com","views":1}]},{"icon":null,"url":"http:\/\/example.com\/","name":"example.com","views":34,"children":null},{"icon":"https:\/\/notarealaddress","url":null,"name":"notarealaddress.example.com","views":33,"children":[{"url":"http:\/\/notarealaddress.example.com\/","name":"notarealaddress.example.com","views":28},{"url":"http:\/\/notarealaddress.example.com\/2014\/08\/26\/notarealaddress\/","name":"notarealaddress.example.com\/2014\/08\/26\/notarealaddress\/","views":2},{"url":"http:\/\/notarealaddress.example.com\/notarealaddress\/","name":"notarealaddress.example.com\/notarealaddress\/","views":1},{"url":"http:\/\/notarealaddress.example.com\/notarealaddress\/","name":"notarealaddress.example.com\/notarealaddress\/","views":1},{"url":"http:\/\/notarealaddress.example.com\/notarealaddress\/","name":"notarealaddress.example.com\/2014\/06\/25\/notarealaddress\/","views":1}]},{"icon":null,"url":null,"name":"example.com","views":31,"children":[{"url":"http:\/\/example.com\/","name":"example.com","views":20},{"url":"http:\/\/example.com\/notarealaddress\/","name":"example.com\/notarealaddress\/","views":4},{"url":"http:\/\/www.example.com\/","name":"example.com","views":4},{"url":"http:\/\/example.com\/notarealaddress\/","name":"example.com\/notarealaddress\/","views":3}]}],"other_clicks":360,"total_clicks":878}},"period":"day"}};
successResponses.statsTags = {
	"code":200,
	"headers": [ {"name":"Content-Type","value":"application\/json"} ],
	"body": {
		"date":"2014-10-01",
		"tags":[
			{"tags": [ {"type":"category","name":"Uncategorized","link":"http:\/\/example.wordpress.com\/category\/uncategorized\/"} ],"views":2381},
			{"tags":[{"type":"tag","name":"supertag-launch","link":"http:\/\/example.wordpress.com\/tag\/supertag-launch\/"}],"views":740},
			{"tags":[{"type":"tag","name":"supertag","link":"http:\/\/example.wordpress.com\/tag\/supertag\/"},{"type":"tag","name":"supertag-transition","link":"http:\/\/example.wordpress.com\/tag\/supertag-transition\/"}],"views":480},
			{"tags":[{"type":"tag","name":"omgtag","link":"http:\/\/example.wordpress.com\/tag\/omgtag\/"}],"views":277},
			{"tags":[{"type":"tag","name":"testytag","link":"http:\/\/example.wordpress.com\/tag\/testytag\/"}],"views":190},
			{"tags":[{"type":"category","name":"testcat","link":"http:\/\/example.wordpress.com\/category\/testcat\/"}],"views":144},
			{"tags":[{"type":"tag","name":"TestTag3","link":"http:\/\/example.wordpress.com\/tag\/TestTag3\/"}],"views":72},
			{"tags":[{"type":"tag","name":"TestTag2","link":"http:\/\/example.wordpress.com\/tag\/TestTag2\/"}],"views":68},
			{"tags":[{"type":"tag","name":"TestTag","link":"http:\/\/example.wordpress.com\/tag\/TestTag\/"}],"views":28}
		]
	}
};

successResponses.statsCountryViews = {
	"code": 200,
	"headers": [{"name":"Content-Type","value":"application\/json"}],
	"body": {
		"date": "2014-09-12",
		"days": { "2014-09-12":
			{ "views": [ { "country_code": "US", "views": 54 }, { "country_code": "IL", "views": 10 }, { "country_code": "DE", "views": 3 }, { "country_code": "GB", "views": 1 }, { "country_code": "AR", "views": 1 } ],
			  "other_views": 0,
			  "total_views": 69
			}
		},
		"country-info": {
			"US":{
				"flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/5a83891a81b057fed56930a6aaaf7b3c?s=48",
				"flat_flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/9f4faa5ad0c723474f7a6d810172447c?s=48",
				"country_full":"United States","map_region":"021"
			},
			"IL":{
				"flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/201a002496cebf356519bec9edba5c05?s=48",
				"flat_flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/dc42629f9a344c099cd8333c53a5280e?s=48",
				"country_full":"Israel","map_region":"145"
			},
			"DE":{
				"flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/e13c43aa12cd8aada2ffb1663970374f?s=48",
				"flat_flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/82f933cabd7491369097f681958bdaed?s=48",
				"country_full":"Germany","map_region":"155"
			},
			"AR":{
				"flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/601fa0ebfba06f8ff8b2de9c16dc89fe?s=48",
				"flat_flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/cdaa4ff258661bc5e6f664981f0b9477?s=48",
				"country_full":"Argentina","map_region":"005"
			},
			"GB":{
				"flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/45d1fd3f398678452fd02153f569ce01?s=48",
				"flat_flag_icon":"https:\/\/secure.gravatar.com\/blavatar\/85ac446c6eefc7e959e15a6877046da3?s=48",
				"country_full":"United Kingdom","map_region":"154"
			}
		}
	}
};

successResponses.statsComments = {
	"code":200,
	"headers":[{"name":"Content-Type","value":"application\/json"}],
	"body": {
		"date":"2014-09-12",
		"authors": [
			{"name":"Commenter 1","link":"?user_id=1","gravatar":"https://0.gravatar.com/avatar/notauser?s=64&amp;r=G","comments":"37","follow_data":{"params":{"stat-source":"stats_comments","follow-text":"Follow","following-text":"Following","following-hover-text":"Unfollow","blog_domain":"example.wordpress.com","blog_url":"http:\/\/example.wordpress.com","blog_id":1,"site_id":1,"blog_title":"Example Blog","is_following":false},"type":"follow"}},
			{"name":"Commenter 2","link":"?user_id=2","gravatar":"https://0.gravatar.com/avatar/notauser?s=64&amp;r=G","comments":"35","follow_data":{"params":{"stat-source":"stats_comments","follow-text":"Follow","following-text":"Following","following-hover-text":"Unfollow","blog_domain":"example.wordpress.com","blog_url":"http:\/\/example.wordpress.com","blog_id":2,"site_id":2,"blog_title":"Example Blog","is_following":false},"type":"follow"}}
		],
		"posts":[
			{"name":"New Dashboard Design and March Wrap-up","link":"http:\/\/en.blog.wordpress.com\/2008\/04\/04\/new-dashboard\/","comments":"10"},
			{"name":"New Dashboard Design","link":"http:\/\/en.blog.wordpress.com\/2008\/12\/05\/new-dashboard-design\/","comments":"11"},
			{"name":"Free Space to Three Gigabytes","link":"http:\/\/en.blog.wordpress.com\/2008\/01\/21\/three-gigabytes\/","comments":"12"},
			{"name":"Challenge for 2011: Want to blog more often?","link":"http:\/\/en.blog.wordpress.com\/2010\/12\/30\/challenge-for-2011-want-to-blog-more-often\/","comments":"12"},
			{"name":"Five Ways to Get Featured on Freshly Pressed","link":"http:\/\/en.blog.wordpress.com\/2010\/04\/28\/five-ways-to-get-featured-on-freshly-pressed\/","comments":"13"},
			{"name":"Now More Than Ever: Just Write","link":"http:\/\/en.blog.wordpress.com\/2011\/05\/19\/just-write\/","comments":"44"},
			{"name":"Post Comments Using Twitter and Facebook","link":"http:\/\/en.blog.wordpress.com\/2011\/06\/07\/post-comments-twitter-facebook\/","comments":"45"},
			{"name":"WP.com Downtime Summary","link":"http:\/\/en.blog.wordpress.com\/2010\/02\/19\/wp-com-downtime-summary\/","comments":"1337"},
			{"name":"Possibly an Announcement","link":"http:\/\/en.blog.wordpress.com\/2008\/04\/25\/possibly-an-announcement\/","comments":"455"},
			{"name":"2.7 Gets Here in Two Days!","link":"http:\/\/en.blog.wordpress.com\/2008\/12\/03\/27-gets-here-in-two-days\/","comments":"123"},
			{"name":"Sticky Posts!","link":"http:\/\/en.blog.wordpress.com\/2008\/09\/08\/sticky-posts\/","comments":"11"}
		],
		"monthly_comments":11,
		"total_comments":"11",
		"most_active_day":"",
		"most_active_time":"19:00",
		"most_commented_post":
			{ "name":"New Dashboard Design and March Wrap-up","link":"http:\/\/en.blog.wordpress.com\/2008\/04\/04\/new-dashboard\/","comments":"11" }
	}
};

exports.successResponses = successResponses;
