/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )();

function StatsParser() {
	if ( ! ( this instanceof StatsParser ) ) {
		return new StatsParser();
	}

	return this;
}

function rangeOfPeriod( period, date ) {
	date = new i18n.moment( date ).locale( 'en' );
	var periodRange = { period: period,
		startOf: date.clone().startOf( period ),
		endOf: date.clone().endOf( period )
	};

	if ( 'week' === period ) {
		if ( '0' === date.format( 'd' ) ) {
			periodRange.startOf.subtract( 6, 'd' );
		} else {
			periodRange.startOf.add( 1, 'd' );
			periodRange.endOf.add( 1, 'd' );
		}
	}
	return periodRange;
}

function parseAvatar( avatarUrl ) {
	var avatar,
		avatarParts;

	if ( avatarUrl ) {
		avatarParts = avatarUrl.split( '?' );
		avatar = avatarParts[ 0 ] + '?d=mm';
	}

	return avatar;
}

StatsParser.prototype.stats = function( payload ) {
	var response = {
		posts: null,
		views: null,
		visitors: null,
		'best-views': {
			day: null,
			count: null
		}
	};

	if ( payload.stats ) {
		response.posts = payload.stats.posts;
		response.views = payload.stats.views;
		response.visitors = payload.stats.visitors;
		response['best-views'].day = payload.stats.views_best_day;
		response['best-views'].count = payload.stats.views_best_day_total;
	}

	return response;

};

StatsParser.prototype.statsInsights = function( payload ) {
	var response = { day: false, percent: 0, hour: 0 },
		dayOfWeek;

	if ( payload.highest_day_of_week || 0 === payload.highest_day_of_week ) {
		// Adjust Day of Week from 0 = Monday to 0 = Sunday (for Moment)
		dayOfWeek = payload.highest_day_of_week + 1;
		if ( dayOfWeek > 6 ) {
			dayOfWeek = 0;
		}

		response.day = i18n.moment().day( dayOfWeek ).format( 'dddd' );
		response.percent = Math.round( payload.highest_day_percent );
		response.hour = i18n.moment().hour( payload.highest_hour ).startOf('hour').format( 'LT' );
		response.hour_percent = Math.round( payload.highest_hour_percent );

	}


	return response;
};

StatsParser.prototype.statsStreak = function( payload ) {
	var response = { days: {}, best: { day: 0, percent: 0 }, max: 0 },
		timestamp,
		datestamp,
		postDay,
		total = 0,
		days = [ 0, 0, 0, 0, 0, 0, 0 ],
		maxDay;

	for ( timestamp in payload.data ) {
		postDay = i18n.moment.unix( timestamp );
		datestamp = postDay.format( 'YYYY-MM-DD' );
		if ( 'undefined' === typeof( response.days[ datestamp ] ) ) {
			response.days[ datestamp ] = 0;
		}

		response.days[ datestamp ] += payload.data[ timestamp ];
		days[ postDay.day() ] += payload.data[ timestamp ];
		total += payload.data[ timestamp ];
	}

	for ( datestamp in response.days ) {
		if ( response.days[ datestamp ] > response.max ) {
			response.max = response.days[ datestamp ];
		}
	}

	maxDay = Math.max.apply( null, days );
	response.best.day = days.indexOf( maxDay );
	if ( total ) {
		response.best.percent = Math.round( 100 * ( maxDay / total ) );
	}

	return response;
};

StatsParser.prototype.statsSearchTerms = function( payload ) {
	var response = { data: [] },
		periodRange = rangeOfPeriod( this.options.period, this.options.date ),
		startDate = periodRange.startOf.format( 'YYYY-MM-DD' );

	if ( payload && payload.date && payload.days && payload.days[ startDate ] ) {
		response.data = payload.days[ startDate ].search_terms.map( function( day ) {
			return {
				label: day.term,
				className: 'user-selectable',
				value: day.views
			};
		} );

		if ( payload.days[ startDate ].encrypted_search_terms ) {
			response.data.push( {
				label: i18n.translate( 'Unknown Search Terms' ),
				value: payload.days[ startDate ].encrypted_search_terms,
				link: 'http://en.support.wordpress.com/stats/#search-engine-terms',
				labelIcon: 'external'
			} );
		}

		if ( payload.days[ startDate ].other_search_terms ) {
			response.viewAll = true;
		}

		if ( payload.days[ startDate ].total_search_terms ) {
			response.total = payload.days[ startDate ].total_views;
		}
	}

	return response;
};

StatsParser.prototype.statsVisits = function( payload ) {
	var response = {},
		attributes = [ 'visits', 'likes', 'visitors', 'comments', 'posts' ];

	response.data = payload.data.map( function( record ) {
		var dataRecord = {}, date, dayOfWeek, localizedDate;

		record.forEach( function( value, i ) {
			// Remove W from weeks
			if ( 'period' === payload.fields[ i ] ) {
				value = value.replace( /W/g, '-' );
			}

			dataRecord[ payload.fields[ i ] ] = value;  // This will support any new fields being added to the api payload
		} );

		// Add in other values to prevent NaN
		attributes.forEach( function( attribute ) {
			if ( 0 !== dataRecord[ attribute ] && ! dataRecord[ attribute ] ) {
				dataRecord[ attribute ] = null;
			}
		} );

		dataRecord.labelDay = '';
		dataRecord.labelWeek = '';
		dataRecord.labelMonth = '';
		dataRecord.labelYear = '';
		dataRecord.classNames = [];

		if ( dataRecord.period ) {
			date = i18n.moment( dataRecord.period, 'YYYY-MM-DD' ).locale( 'en' );
			localizedDate = i18n.moment( dataRecord.period, 'YYYY-MM-DD' );
			if ( date.isValid() ) {
				dayOfWeek = date.toDate().getDay();
				if ( ( 'day' === payload.unit ) && ( ( 6 === dayOfWeek ) || ( 0 === dayOfWeek ) ) ) {
					dataRecord.classNames.push( 'is-weekend' );
				}
				dataRecord.labelDay = localizedDate.format( 'MMM D' );
				dataRecord.labelWeek = localizedDate.format( 'MMM D' );
				dataRecord.labelMonth = localizedDate.format( 'MMM' );
				dataRecord.labelYear = localizedDate.format( 'YYYY' );
			}
		}

		return dataRecord;
	} );

	return response;
};

StatsParser.prototype.statsPublicize = function( payload ) {
	var response = { data: [] },
		serviceInfo;

	serviceInfo = {
		twitter: {
			label: 'Twitter',
			icon: 'https://secure.gravatar.com/blavatar/7905d1c4e12c54933a44d19fcd5f9356?s=48'
		},
		facebook: {
			label: 'Facebook',
			icon: 'https://secure.gravatar.com/blavatar/2343ec78a04c6ea9d80806345d31fd78?s=48'
		},
		tumblr: {
			label: 'Tumblr',
			icon: 'https://secure.gravatar.com/blavatar/84314f01e87cb656ba5f382d22d85134?s=48'
		},
		google_plus: {
			label: 'Google+',
			icon: 'https://secure.gravatar.com/blavatar/4a4788c1dfc396b1f86355b274cc26b3?s=48'
		},
		linkedin: {
			label: 'LinkedIn',
			icon: 'https://secure.gravatar.com/blavatar/f54db463750940e0e7f7630fe327845e?s=48'
		},
		path: {
			label: 'Path',
			icon: 'https://secure.gravatar.com/blavatar/3a03c8ce5bf1271fb3760bb6e79b02c1?s=48'
		}
	};

	if ( payload && payload.services ) {
		response.data = payload.services.map( function ( service ) {
			var info = serviceInfo[ service.service ];
			return {
				label: info.label,
				value: service.followers,
				icon: info.icon
			};
		} );
	}

	return response;
};

StatsParser.prototype.statsEvents = function( payload ) {
	var response = { data: [], resultCount: 0 };

	if ( payload && payload.posts ) {
		response.data = payload.posts.map( function( post ) {
			var detailPage = '/stats/post/' + post.ID + '/' + this.options.domain;

			return {
				label: post.title,
				page: detailPage
			};
		}, this );

		response.resultCount = payload.found;
	}

	return response;
};

StatsParser.prototype.statsReferrers = function( payload ) {
	var response = { data: [] },
		periodRange = rangeOfPeriod( this.options.period, this.options.date ),
		startDate = periodRange.startOf.format( 'YYYY-MM-DD' );

	if ( payload && payload.date && payload.days && payload.days[ startDate ] && payload.days[ startDate ].groups ) {
		response.data = payload.days[ startDate ].groups.map( function( item ) {
			var record,
				actions = [],
				hasChildren = item.results && item.results.length > 0;

			if ( ( item.url && -1 !== item.url.indexOf( item.name ) ) || ( ! item.url && item.name === item.group && -1 !== item.name.indexOf('.') ) ) {
				actions.push( {
					type: 'spam',
					data: {
						siteID: this.siteID,
						domain: item.name
					}
				} );
			}

			record = {
				label: item.name,
				value: item.total,
				link: item.url,
				labelIcon: hasChildren ? null : 'external',
				icon: item.icon,
				actions: actions,
				actionMenu: actions.length,
				children: null
			};

			if ( hasChildren ) {
				record.children = item.results.map( function( child ) {
					var childData = child.children,
						children,
						childRecord;

					if ( childData ) {
						children = childData.map( function( item ) {
							return {
								label: item.name,
								value: item.views,
								link: item.url,
								labelIcon: 'external'
							};
						} );
					}

					childRecord = {
						label: child.name,
						value: child.views,
						link: child.url,
						labelIcon: childData ? null : 'external',
						children: children
					};

					if ( child.icon ) {
						childRecord.icon = child.icon;
					}

					return childRecord;
				} );
			}

			return record;
		}, this );

		if ( payload.days[ startDate ].other_views ) {
			response.viewAll = true;
		}

		if ( payload.days[ startDate ].total_views ) {
			response.total = payload.days[ startDate ].total_views;
		}
	}

	return response;
};

StatsParser.prototype.statsTopAuthors = function( payload ) {
	var response = {
			data: []
		},
		periodRange = rangeOfPeriod( this.options.period, this.options.date ),
		startDate = periodRange.startOf.format( 'YYYY-MM-DD' );

	if ( payload.days && payload.date && payload.days[ startDate ] ) {
		response.data = payload.days[ startDate ].authors.map( function( item ) {
			var record = {
				label: item.name,
				iconClassName: 'avatar-user',
				icon: parseAvatar( item.avatar ),
				children: null,
				value: item.views,
				className: 'module-content-list-item-large',
				actions: [ {
					type: 'follow',
					data: item.follow_data ? item.follow_data.params : false
				} ]
			};

			if ( item.posts && item.posts.length > 0 ) {
				record.children = item.posts.map( function( child ) {
					return {
						label: child.title,
						value: child.views,
						page: this.options ? '/stats/post/' + child.id + '/' + this.options.domain : null,
						actions: [ {
							type: 'link',
							data: child.url
						} ],
						children: null
					};
				}, this );
			}

			return record;
		}, this );

		if ( payload.days[ startDate ].other_views ) {
			response.viewAll = true;
		}
	}

	return response;
};

StatsParser.prototype.statsVideo = function( payload ) {
	var data = {
		data: [],
		pages: [],
		post: null
	};

	if ( payload && payload.data ) {
		var views = payload.data.map( function( item ) {
			var date = i18n.moment( item[ 0 ] );
			return { period: date.format( 'MMM D' ), value: item[ 1 ] };
		} );
		data.data = views.slice( Math.max( views.length - 10, 1 ) );
		data.post = payload.post;
	}

	if ( payload && payload.pages) {
		data.pages = payload.pages.map( function( item ) {
			return {
				label: item,
				link: item
			};
		} );
	}

	return data;
};

StatsParser.prototype.statsFollowers = function( payload ) {
	var data = {
		page: 0,
		pages: 0,
		total: 0,
		total_wpcom: 0,
		total_email: 0,
		subscribers: [],
		viewAll: false
	};

	data.page = payload.page || 0;
	data.pages = payload.pages || 0;
	data.total = payload.total || 0;
	data.total_wpcom = payload.total_wpcom || 0;
	data.total_email = payload.total_email || 0;
	data.viewAll = ( data.pages > 1 ) ? true : false;

	if ( payload.subscribers ) {
		data.subscribers = payload.subscribers.map( function( item ) {
			return {
				label: item.label,
				iconClassName: 'avatar-user',
				icon: parseAvatar( item.avatar ),
				link: item.url,
				value: {
					type: 'relative-date',
					value: item.date_subscribed
				},
				actions: [ {
					type: 'follow',
					data: item.follow_data ? item.follow_data.params : false
				} ]
			};
		} );
	}

	return { data: data };
};

StatsParser.prototype.statsCommentFollowers = function( payload ) {
	var data = {
		page: 0,
		pages: 0,
		total: 0,
		posts: [],
		viewAll: false
	};

	data.page = payload.page || 0;
	data.pages = payload.pages || 0;
	data.total = payload.total || 0;
	data.viewAll = ( data.pages > 1 ) ? true : false;

	if ( payload.posts ) {
		data.posts = payload.posts.map( function( item ) {
			if ( 0 === item.id ) {
				return {
					label: 'All Posts',
					value: item.followers
				};
			}
			return {
				label: item.title,
				link: item.url,
				labelIcon: 'external',
				value: item.followers
			};
		} );
	}

	return { data: data };
};

StatsParser.prototype.statsPostViews = function( payload ) {
	var views,
		defaultPostTitle = i18n.translate( 'Post %(number)d', {
			args: {
				number: this.options.post
			},
			context: 'Stats: Title shown on Post Stats page'
		} ),
		data = {
			post: {},
			views: [],
			years: {},
			averages: {},
			weeks: [],
			highest_month: 0,
			highest_day_average: 0,
			highest_week_average: 0
		};

	if ( ! this.options.post ) {
		defaultPostTitle = 'Home page / Archives';
	}

	if ( payload ) {
		if ( payload.data ) {
			views = payload.data.map( function( item ) {
				var date = i18n.moment( item[ 0 ] );
				return { period: date.format( 'MMM D' ), value: item[ 1 ] };
			} );
			data.data = views.slice( Math.max( views.length - 10, 1 ) );
		}
		data.years = payload.years || {};
		data.averages = payload.averages || {};
		data.weeks = payload.weeks || [];
		data.highest_month = payload.highest_month || 0;
		data.highest_day_average = payload.highest_day_average || 0;
		data.highest_week_average = payload.highest_week_average || 0;
		data.post = payload.post || { post_title: defaultPostTitle };
	}
	return data;
};

StatsParser.prototype.statsVideoPlays = function( payload ) {
	var response = { data: [] },
		periodRange = rangeOfPeriod( this.options.period, this.options.date ),
		startDate = periodRange.startOf.format( 'YYYY-MM-DD' );

	if ( payload && payload.date && payload.days && payload.days[ startDate ] ) {
		response.data = payload.days[ startDate ].plays.map( function( item ) {
			var detailPage = '/stats/' + this.options.period + '/videodetails/' + this.options.domain + '?post=' + item.post_id;
			return {
				label: item.title,
				page: detailPage,
				value: item.plays,
				actions: [ {
					type: 'link',
					data: item.url
				} ]
			};
		}, this );

		if ( payload.days[ startDate ].other_plays ) {
			response.summaryPage = this.options ? '/stats/' + this.options.period + '/videoplays/' + this.options.domain + '?startDate=' + startDate : null;
		}

		if ( payload.days[ startDate ].total_plays ) {
			response.total = payload.days[ startDate ].total_plays;
		}
	}

	return response;
};

StatsParser.prototype.statsComments = function( payload ) {
	var response = {
			data: {
				authors: [],
				posts: []
			}
		},
		site = sites.getSite( this.options.domain ),
		adminUrl = site ? site.options.admin_url : 'http://' + this.options.domain + '/wp-admin/';

	if ( payload.authors ) {
		response.data.authors = payload.authors.map( function( author ) {
			return {
				label: author.name,
				value: author.comments,
				iconClassName: 'avatar-user',
				icon: parseAvatar( author.gravatar ),
				link: adminUrl + 'edit-comments.php' + author.link,
				className: 'module-content-list-item-large',
				actions: [
					{
						type: 'follow',
						data: author.follow_data ? author.follow_data.params : false
					}
				]
			};
		}, this );
	}

	if ( payload.posts ) {
		response.data.posts = payload.posts.map( function( post ) {
			return {
				label: post.name,
				value: post.comments,
				page: this.options ? '/stats/post/' + post.id + '/' + this.options.domain : null,
				actions: [ {
					type: 'link',
					data: post.link
				} ]
			};
		}, this );
	}
	return response;
};

StatsParser.prototype.statsTopPosts = function( payload ) {
	var response = {
			data: []
		},
		periodRange = rangeOfPeriod( this.options.period, this.options.date ),
		startDate = periodRange.startOf.format( 'YYYY-MM-DD' );

	if ( payload && payload.date && payload.days && payload.days[ startDate ] && payload.days[ startDate ].postviews ) {
		response.data = payload.days[ startDate ].postviews.map( function( item ) {
			var detailPage = '/stats/post/' + item.id + '/' + this.options.domain,
				postDate,
				children,
				inPeriod = false;

			if ( item.date ) {
				postDate = i18n.moment( item.date );

				if (
					( postDate.isAfter( periodRange.startOf ) || postDate.isSame( periodRange.startOf ) ) &&
					( postDate.isBefore( periodRange.endOf ) || postDate.isSame( periodRange.endOf ) )
				) {
					inPeriod = true;
				}
			}

			if ( item.children ) {
				children = item.children.map( function( child ) {
					return {
						label: child.title,
						value: child.views,
						link: child.link,
						labelIcon: 'attachment'
					};
				} );
			}

			return {
				label: item.title,
				value: item.views,
				page: detailPage,
				actions: [ {
					type: 'link',
					data: item.href
				} ],
				labelIcon: null,
				children: null,
				className: inPeriod ? 'published' : null
			};
		}, this );

		if ( payload.days[ startDate ].other_views ) {
			response.viewAll = true;
		}

		if ( payload.days[ startDate ].total_views ) {
			response.total = payload.days[ startDate ].total_views;
		}
	}

	return response;
};

StatsParser.prototype.statsTags = function( payload ) {
	var response = {
			data: []
		};

		if ( payload && payload.tags ) {
			response.data = payload.tags.map( function( item ) {
				var children,
					hasChildren = item.tags.length > 1,
					labels;

				labels = item.tags.map( function( tagItem ) {
					var iconType;

					switch ( tagItem.type ) {
						case ( 'tag' ):
							iconType = 'tag';
							break;
						case ( 'category' ):
							iconType = 'folder';
							break;
						default:
							iconType = tagItem.type;
					}

					return {
						label: tagItem.name,
						labelIcon: iconType,
						link: hasChildren ? null : tagItem.link
					};
				} );

				if ( hasChildren ) {
					children = item.tags.map( function( tagItem ) {
						var iconType;

						switch ( tagItem.type ) {
							case ( 'tag' ):
								iconType = 'tag';
								break;
							case ( 'category' ):
								iconType = 'folder';
								break;
							default:
								iconType = tagItem.type;
						}

						return {
							label: tagItem.name,
							labelIcon: iconType,
							value: null,
							children: null,
							link: tagItem.link
						};
					} );
				}

				return {
					label: labels,
					link: labels.length > 1 ? null : labels[ 0 ].link,
					value: item.views,
					children: children
				};

			} );
		}

	return response;
};

StatsParser.prototype.statsClicks = function( payload ) {
	var response = {},
		data = [],
		periodRange = rangeOfPeriod( this.options.period, this.options.date ),
		startDate = periodRange.startOf.format( 'YYYY-MM-DD' );

	if ( payload.date && payload.days && payload.days[ startDate ] ) {
		payload.days[ startDate ].clicks.forEach( function( item ) {
			var newRecord,
				hasChildren = item.children && item.children.length > 0;

			newRecord = {
				label: item.name,
				value: item.views,
				children: null,
				link: item.url,
				icon: item.icon,
				labelIcon: hasChildren ? null : 'external'
			};

			if ( item.children ) {
				newRecord.children = [];

				item.children.forEach( function( child ) {
					var childRecord = {
						label: child.name,
						value: child.views,
						children: null,
						link: child.url,
						labelIcon: 'external'
					};
					newRecord.children.push( childRecord );
				}, this );
			}

			data.push( newRecord );

		}, this );

		if( payload.days[ startDate ].other_clicks ) {
			response.viewAll = true;
		}

		if( payload.days[ startDate ].total_clicks ) {
			response.total = payload.days[ startDate ].total_clicks;
		}

	}

	response.data = data;

	return response;
};

StatsParser.prototype.statsCountryViews = function( payload ) {
	var response = {},
		data = [],
		periodRange = rangeOfPeriod( this.options.period, this.options.date ),
		startDate = periodRange.startOf.format( 'YYYY-MM-DD' );

	if( payload && payload.days && payload.days[ startDate ] && payload.days[ startDate ].views ) {

		data = payload.days[ startDate ].views.filter( function( viewsObject ) {
			var country = payload[ 'country-info' ][ viewsObject.country_code ];
			return country;
		} ).map( function( viewsObject ) {
			var country = payload[ 'country-info' ][ viewsObject.country_code ],
				icon = country.flat_flag_icon.match( /grey\.png/ ) ? null : country.flat_flag_icon;

			return {
				label: country.country_full.replace( /’/, "'" ),
				value: viewsObject.views,
				region: country.map_region,
				icon: icon
			};
		} );

		if( payload.days[ startDate ].other_views && payload.days[ startDate ].other_views > 0 ) {
			response.viewAll = true;
		}

		if( payload.days[ startDate ].total_views ) {
			response.total = payload.days[ startDate ].total_views;
		}
	}

	response.data = data;
	return response;
};

module.exports = StatsParser;
