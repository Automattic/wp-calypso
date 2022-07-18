'use strict';
( self.webpackChunkdsp_client = self.webpackChunkdsp_client || [] ).push( [
	[ 178 ],
	{
		9178: function ( e, t, n ) {
			n.r( t ),
				n.d( t, {
					default: function () {
						return Gn;
					},
				} );
			var i,
				r,
				a,
				s,
				o,
				c,
				d,
				l,
				u,
				p,
				g = n( 2791 ),
				m = n( 4164 ),
				h = n( 364 ),
				f = n( 168 ),
				x = n( 885 ),
				A = n( 4165 ),
				v = n( 5861 ),
				y = ( n( 1153 ), n( 7665 ), n( 8012 ), n( 949 ), n( 3509 ), n( 5556 ), n( 5574 ) ),
				b = n( 5661 ),
				C = n( 1889 ),
				j = n( 8870 ),
				Z = n( 3400 ),
				E = n( 9157 ),
				_ = n( 9658 ),
				T = n( 1614 ),
				S = n( 7123 ),
				B = n( 6151 ),
				w = n( 9823 ),
				P = n( 1413 ),
				k = n( 5931 ),
				D = n( 890 ),
				O = n( 9276 ),
				U = n( 184 ),
				L = {
					easing: { enter: 'linear', exit: 'inherit' },
					direction: 'left',
					mountOnEnter: ! 0,
					unmountOnExit: ! 0,
				},
				q = function ( e ) {
					var t = e.onClickGetStarted;
					return ( 0, U.jsx )(
						k.Z,
						( 0, P.Z )(
							( 0, P.Z )( { in: ! 0 }, L ),
							{},
							{
								children: ( 0, U.jsx )( C.ZP, {
									container: ! 0,
									sx: { height: '100%', alignItems: 'center' },
									children: ( 0, U.jsxs )( C.ZP, {
										item: ! 0,
										xs: 12,
										children: [
											( 0, U.jsx )( D.Z, {
												variant: 'h1',
												sx: { mb: 2, mt: 4 },
												textAlign: 'center',
												children: '\ud83d\ude80',
											} ),
											( 0, U.jsx )( D.Z, {
												variant: 'h1',
												sx: { mb: 3 },
												textAlign: 'center',
												children: "Let's promote your post!",
											} ),
											( 0, U.jsx )( O.Z, {
												sx: { textAlign: 'center', mb: 2 },
												children: ( 0, U.jsx )( D.Z, {
													variant: 'subtitle1',
													sx: {
														textAlign: 'center',
														mb: 2,
														display: 'inline-block',
														width: '500px',
													},
													textAlign: 'center',
													component: 'div',
													children:
														'Find your audience by promoting this post across our global network of WordPress sites.',
												} ),
											} ),
											( 0, U.jsx )( O.Z, {
												sx: { textAlign: 'center', mb: 2 },
												children: ( 0, U.jsx )( B.Z, {
													size: 'large',
													variant: 'contained',
													onClick: t,
													children: 'Get Started',
												} ),
											} ),
											( 0, U.jsx )( D.Z, {
												variant: 'subtitle2',
												sx: { mb: 4, mt: 2 },
												textAlign: 'center',
												component: 'div',
												color: 'text.secondary',
												children: 'It takes less than 5 minutes.',
											} ),
										],
									} ),
								} ),
							}
						)
					);
				},
				R = n( 242 ),
				I = n( 4512 ),
				M = n( 5825 );
			! ( function ( e ) {
				( e.PENDING = 'pending' ), ( e.APPROVED = 'approved' ), ( e.REJECTED = 'rejected' );
			} )( i || ( i = {} ) ),
				( function ( e ) {
					( e.wpcomPost = 'wpcom-post' ),
						( e.app = 'app' ),
						( e.url = 'url' ),
						( e.tumblrPost = 'tsp' );
				} )( r || ( r = {} ) ),
				( function ( e ) {
					( e.image = 'image' ),
						( e.article = 'article' ),
						( e.video = 'video' ),
						( e.product = 'product' );
				} )( a || ( a = {} ) ),
				( function ( e ) {
					( e.Facebook = 'facebook' ),
						( e.Twitter = 'twitter' ),
						( e.Google = 'google' ),
						( e.WordPress = 'wordpress' ),
						( e.Tumblr = 'tumblr' );
				} )( s || ( s = {} ) ),
				( function ( e ) {
					( e[ ( e.DRAFT = 0 ) ] = 'DRAFT' ),
						( e[ ( e.PREBOOKED = 1 ) ] = 'PREBOOKED' ),
						( e[ ( e.BOOKED = 2 ) ] = 'BOOKED' ),
						( e[ ( e.SOLD = 3 ) ] = 'SOLD' );
				} )( o || ( o = {} ) ),
				( function ( e ) {
					( e.text = 'text' ),
						( e.image = 'image' ),
						( e.video = 'video' ),
						( e.tsp = 'tsp' ),
						( e.article = 'article' ),
						( e.product = 'product' );
				} )( c || ( c = {} ) ),
				( function ( e ) {
					( e.post = 'post' ), ( e.page = 'page' ), ( e.product = 'product' );
				} )( d || ( d = {} ) ),
				( function ( e ) {
					( e.wpcomPost = 'wpcom-post' ), ( e.tumblrPost = 'tsp' ), ( e.url = 'url' );
				} )( l || ( l = {} ) ),
				( function ( e ) {
					( e[ ( e.intro = 0 ) ] = 'intro' ),
						( e[ ( e.goalType = 1 ) ] = 'goalType' ),
						( e[ ( e.selectAsset = 2 ) ] = 'selectAsset' ),
						( e[ ( e.adType = 3 ) ] = 'adType' ),
						( e[ ( e.siteTargeting = 4 ) ] = 'siteTargeting' ),
						( e[ ( e.selectSiteAsset = 5 ) ] = 'selectSiteAsset' ),
						( e[ ( e.previewCreative = 6 ) ] = 'previewCreative' ),
						( e[ ( e.budgetTiming = 7 ) ] = 'budgetTiming' ),
						( e[ ( e.paymentMethod = 8 ) ] = 'paymentMethod' ),
						( e[ ( e.pay = 9 ) ] = 'pay' ),
						( e[ ( e.config = 10 ) ] = 'config' ),
						( e[ ( e.confirmAd = 11 ) ] = 'confirmAd' ),
						( e[ ( e.finish = 12 ) ] = 'finish' );
				} )( u || ( u = {} ) ),
				( function ( e ) {
					( e.desktop = 'desktop' ), ( e.mobile = 'mobile' ), ( e.tablet = 'tablet' );
				} )( p || ( p = {} ) );
			var F = n( 1475 ),
				W = n.n( F ),
				z = [
					{ label: 'Preview', steps: [ u.intro, u.selectSiteAsset, u.previewCreative ] },
					{ label: 'Audience', steps: [ u.siteTargeting ] },
					{ label: 'Details & Payment', steps: [ u.budgetTiming, u.pay, u.config, u.confirmAd ] },
					{ label: 'Finish!', steps: [ u.finish ] },
				],
				H = function ( e ) {
					var t = e.formStep,
						n =
							W()( z, function ( e ) {
								return e.steps.includes( t );
							} ) || 0;
					return ( 0, U.jsx )( C.ZP, {
						item: ! 0,
						xs: 12,
						children: ( 0, U.jsx )( R.Z, {
							sx: { mb: 2 },
							activeStep: n,
							alternativeLabel: ! 0,
							children: z.map( function ( e ) {
								var t = e.label;
								return ( 0, U.jsx )( I.Z, { children: ( 0, U.jsx )( M.Z, { children: t } ) }, t );
							} ),
						} ),
					} );
				},
				G = n( 5273 ),
				N = n( 1465 ),
				K = n( 255 ),
				Q = ( function () {
					var e = ( 0, v.Z )(
						( 0, A.Z )().mark( function e( t, n, i ) {
							var r, a, s, o;
							return ( 0, A.Z )().wrap( function ( e ) {
								for (;;)
									switch ( ( e.prev = e.next ) ) {
										case 0:
											return (
												( r =
													n.getState().adBuilder.widgetParams.apiHost ||
													{
														NODE_ENV: 'production',
														PUBLIC_URL: '',
														WDS_SOCKET_HOST: void 0,
														WDS_SOCKET_PATH: void 0,
														WDS_SOCKET_PORT: void 0,
														FAST_REFRESH: ! 0,
														REACT_APP_BUILD_TARGET: 'widget',
													}.REACT_APP_DSP_API_HOST ||
													'' ),
												( a =
													n.getState().adBuilder.widgetParams.apiPrefix ||
													{
														NODE_ENV: 'production',
														PUBLIC_URL: '',
														WDS_SOCKET_HOST: void 0,
														WDS_SOCKET_PATH: void 0,
														WDS_SOCKET_PORT: void 0,
														FAST_REFRESH: ! 0,
														REACT_APP_BUILD_TARGET: 'widget',
													}.REACT_APP_DSP_API_PREFIX ||
													'' ),
												( s = ''.concat( r ).concat( a ).concat( Y ) ),
												( o = ( 0, K.ni )( {
													baseUrl: s,
													prepareHeaders: function ( e, t ) {
														var n = t.getState;
														e.set( 'accept', 'application/json' );
														var i = n().adBuilder.widgetParams.authToken;
														return (
															i &&
																( i.startsWith( 'rlt-' )
																	? e.set( 'Authorization', 'X_WPCOM_RLT '.concat( i ) )
																	: e.set( 'Authorization', 'Bearer '.concat( i ) ) ),
															e
														);
													},
												} ) ),
												e.abrupt( 'return', o( t, n, i ) )
											);
										case 5:
										case 'end':
											return e.stop();
									}
							}, e );
						} )
					);
					return function ( t, n, i ) {
						return e.apply( this, arguments );
					};
				} )(),
				Y = '/api/v1',
				V = ( 0, N.LC )( {
					reducerPath: 'dspAPI',
					tagTypes: [
						'Campaigns',
						'CampaignsFull',
						'Ads',
						'Creatives',
						'AssetsSites',
						'AssetsPosts',
						'AssetsProducts',
						'Continents',
						'SiteLanguages',
						'SiteTopics',
						'Locations',
						'User',
					],
					baseQuery: Q,
					endpoints: function ( e ) {
						return {
							getUserInfo: e.query( {
								query: function ( e ) {
									return { url: '/user' };
								},
								providesTags: [ 'User' ],
							} ),
							getCampaigns: e.query( {
								query: function ( e ) {
									return { url: '/campaigns' };
								},
								providesTags: [ 'Campaigns' ],
							} ),
							getCampaignsFull: e.query( {
								query: function ( e ) {
									return { url: '/campaigns/full' };
								},
								providesTags: [ 'CampaignsFull' ],
							} ),
							getCampaign: e.query( {
								query: function ( e ) {
									return { url: '/campaigns/'.concat( e.campaign_id ) };
								},
								providesTags: [ 'Campaigns' ],
							} ),
							createCampaign: e.mutation( {
								query: function ( e ) {
									return { url: '/campaigns', method: 'POST', body: e };
								},
								invalidatesTags: [ 'Campaigns' ],
							} ),
							editCampaign: e.mutation( {
								query: function ( e ) {
									return { url: '/campaigns/'.concat( e.campaign_id ), method: 'PATCH', body: e };
								},
								invalidatesTags: [ 'Campaigns' ],
							} ),
							deleteCampaign: e.mutation( {
								query: function ( e ) {
									return { url: '/campaigns/'.concat( e.campaign_id ), method: 'DELETE' };
								},
								invalidatesTags: [ 'Campaigns' ],
							} ),
							stopCampaign: e.mutation( {
								query: function ( e ) {
									return { url: '/campaigns/'.concat( e.campaign_id, '/stop' ), method: 'POST' };
								},
								invalidatesTags: [ 'Campaigns' ],
							} ),
							createAd: e.mutation( {
								query: function ( e ) {
									return {
										url: '/campaigns/'.concat( e.campaign_id, '/ads' ),
										method: 'POST',
										body: e,
									};
								},
								invalidatesTags: [ 'Campaigns', 'Ads' ],
							} ),
							editAd: e.mutation( {
								query: function ( e ) {
									return {
										url: '/campaigns/'.concat( e.campaign_id, '/ads/' ).concat( e.ad_id ),
										method: 'PATCH',
										body: e,
									};
								},
								invalidatesTags: [ 'Campaigns', 'Ads' ],
							} ),
							deleteAd: e.mutation( {
								query: function ( e ) {
									return {
										url: '/campaigns/'.concat( e.campaign_id, '/ads/' ).concat( e.ad_id ),
										method: 'DELETE',
									};
								},
								invalidatesTags: [ 'Ads' ],
							} ),
							getAds: e.query( {
								query: function ( e ) {
									return { url: '/campaigns/'.concat( e.campaign_id, '/ads' ) };
								},
								providesTags: [ 'Ads' ],
							} ),
							getAd: e.query( {
								query: function ( e ) {
									return { url: '/campaigns/'.concat( e.campaign_id, '/ads/' ).concat( e.ad_id ) };
								},
								providesTags: [ 'Campaigns' ],
							} ),
							getCreatives: e.query( {
								query: function ( e ) {
									return {
										url: '/campaigns/'
											.concat( e.campaign_id, '/ads/' )
											.concat( e.ad_id, '/creatives' ),
									};
								},
								providesTags: [ 'Creatives' ],
							} ),
							getCreative: e.query( {
								query: function ( e ) {
									return {
										url: '/campaigns/'
											.concat( e.campaign_id, '/ads/' )
											.concat( e.ad_id, '/creatives/' )
											.concat( e.creative_id ),
									};
								},
								providesTags: [ 'Creatives' ],
							} ),
							deleteCreative: e.mutation( {
								query: function ( e ) {
									return {
										url: '/campaigns/'
											.concat( e.campaign_id, '/ads/' )
											.concat( e.ad_id, '/creatives/' )
											.concat( e.creative_id ),
										method: 'DELETE',
									};
								},
								invalidatesTags: [ 'Creatives' ],
							} ),
							editCreative: e.mutation( {
								query: function ( e ) {
									return {
										url: '/campaigns/'
											.concat( e.campaign_id, '/ads/' )
											.concat( e.ad_id, '/creatives/' )
											.concat( e.creative_id ),
										method: 'PATCH',
										body: e,
									};
								},
								invalidatesTags: [ 'Creatives' ],
							} ),
							getSites: e.query( {
								query: function ( e ) {
									return { url: '/wpcom/sites' };
								},
								providesTags: [ 'AssetsSites' ],
							} ),
							getSitePosts: e.query( {
								query: function ( e ) {
									var t = e.site_id,
										n = e.post_type,
										i = e.pagination,
										r = i.page,
										a = i.limit,
										s = i.page_handle;
									return {
										url: '/wpcom/sites/'
											.concat( t, '/posts?' )
											.concat(
												( s
													? 'page_handle='.concat( s )
													: r
													? 'page='.concat( r, '&limit=' ).concat( a )
													: '' ) + ( n ? '&post_type='.concat( n ) : '' )
											),
									};
								},
								providesTags: [ 'AssetsPosts' ],
							} ),
							getSitePost: e.query( {
								query: function ( e ) {
									var t = e.site_id,
										n = e.post_id;
									return { url: '/wpcom/sites/'.concat( t, '/posts/' ).concat( n ) };
								},
								providesTags: [ 'AssetsPosts' ],
							} ),
							getSiteAssets: e.query( {
								query: function ( e ) {
									var t = e.site_id,
										n = e.post_id;
									return { url: '/wpcom/sites/'.concat( t, '/posts/' ).concat( n, '/media' ) };
								},
								providesTags: [ 'AssetsPosts' ],
							} ),
							getSmartAvailableContinents: e.query( {
								query: function () {
									return { url: '/smart/continents', method: 'GET' };
								},
								providesTags: [ 'Continents' ],
							} ),
							getAvailableSiteTargetLanguages: e.query( {
								query: function () {
									return { url: '/smart/target/site/languages', method: 'GET' };
								},
								providesTags: [ 'SiteLanguages' ],
							} ),
							getAvailableSiteTargetTopics: e.query( {
								query: function () {
									return { url: '/smart/target/site/topics', method: 'GET' };
								},
								providesTags: [ 'SiteTopics' ],
							} ),
							getAvailableLocations: e.query( {
								query: function () {
									return { url: '/locations', method: 'GET' };
								},
							} ),
							getHelloWorld: e.query( {
								query: function ( e ) {
									return { url: '/helloWorld', params: e };
								},
							} ),
							userAuthCheck: e.query( {
								query: function () {
									return { url: '/user/check', method: 'GET' };
								},
								providesTags: [ 'User' ],
							} ),
						};
					},
				} ),
				J = ( V.useGetUserInfoQuery, V.useGetHelloWorldQuery, V.useUserAuthCheckQuery ),
				$ =
					( V.useGetCampaignQuery,
					V.useGetAdsQuery,
					V.useGetAdQuery,
					V.useGetCampaignsQuery,
					V.useGetCampaignsFullQuery,
					V.useCreateCampaignMutation,
					V.useDeleteCampaignMutation,
					V.useStopCampaignMutation,
					V.useEditCampaignMutation,
					V.useCreateAdMutation,
					V.useDeleteAdMutation,
					V.useEditAdMutation,
					V.useGetCreativesQuery,
					V.useGetCreativeQuery,
					V.useDeleteCreativeMutation,
					V.useEditCreativeMutation,
					V.useGetSitesQuery,
					V.useGetSitePostsQuery,
					V.useGetSitePostQuery ),
				X =
					( V.useGetSiteAssetsQuery,
					V.useGetSmartAvailableContinentsQuery,
					V.useGetAvailableSiteTargetLanguagesQuery ),
				ee = V.useGetAvailableSiteTargetTopicsQuery,
				te = V.useGetAvailableLocationsQuery;
			var ne = {
					formStep: 0,
					builderMode: 'widget',
					ad: {
						budget_cents: 500,
						start_date: new Date().toISOString(),
						end_date: new Date( Date.now() + 6048e5 ).toISOString(),
						type: a.article,
						goal_type: r.wpcomPost,
						device_target_type: [ p.desktop ],
					},
					paymentMethod: 'purchase',
					widgetParams: {},
					nextButtonEnabled: ! 0,
					article: {
						title: 'Page Title',
						snippet: 'Article Snippet',
						clickUrl: '',
						imageUrl: '',
						imageMimeType: '',
					},
					publishStatus: {
						campaignCreatedId: null,
						campaignCreated: ! 1,
						adCreated: ! 1,
						assetsUploaded: ! 1,
						submitted: ! 1,
					},
				},
				ie = Y,
				re = { Accept: 'application/json', 'Content-Type': 'application/json' },
				ae = ( function () {
					var e = ( 0, v.Z )(
						( 0, A.Z )().mark( function e( t ) {
							var n;
							return ( 0, A.Z )().wrap( function ( e ) {
								for (;;)
									switch ( ( e.prev = e.next ) ) {
										case 0:
											return (
												( e.next = 2 ),
												fetch( ''.concat( ie, '/image/' ).concat( encodeURIComponent( t ) ), {
													method: 'GET',
													headers: { accept: 'image/*', authorization: re.Authorization },
												} )
											);
										case 2:
											return ( n = e.sent ), ( e.next = 5 ), n.blob();
										case 5:
											return e.abrupt( 'return', e.sent );
										case 6:
										case 'end':
											return e.stop();
									}
							}, e );
						} )
					);
					return function ( t ) {
						return e.apply( this, arguments );
					};
				} )(),
				se = ( function () {
					var e = ( 0, v.Z )(
						( 0, A.Z )().mark( function e( t, n ) {
							var i, r, a;
							return ( 0, A.Z )().wrap( function ( e ) {
								for (;;)
									switch ( ( e.prev = e.next ) ) {
										case 0:
											return (
												( i = {
													name: t.title,
													description: '',
													start_date: n.start_date,
													end_date: n.end_date,
												} ),
												( e.next = 3 ),
												fetch( ''.concat( ie, '/campaigns' ), {
													method: 'POST',
													body: JSON.stringify( i ),
													headers: re,
												} )
											);
										case 3:
											return ( r = e.sent ), ( e.next = 6 ), r.json();
										case 6:
											if ( ( ( a = e.sent ), r.ok ) ) {
												e.next = 9;
												break;
											}
											throw new Error( 'Creating campaign failed' );
										case 9:
											return e.abrupt( 'return', a );
										case 10:
										case 'end':
											return e.stop();
									}
							}, e );
						} )
					);
					return function ( t, n ) {
						return e.apply( this, arguments );
					};
				} )(),
				oe = ( function () {
					var e = ( 0, v.Z )(
						( 0, A.Z )().mark( function e( t, n, i, r ) {
							var a, s, o;
							return ( 0, A.Z )().wrap( function ( e ) {
								for (;;)
									switch ( ( e.prev = e.next ) ) {
										case 0:
											return (
												( a = {
													campaign_id: i.campaign_id,
													name: t.title,
													description: '',
													start_date: n.start_date,
													end_date: n.end_date,
													budget_cents: n.budget_cents,
													type: n.type,
													goal_type: n.goal_type,
													target_urn: r.urn,
													user_target_geo: n.user_target_geo,
													device_target_type: n.device_target_type,
													content_target_language: n.content_target_language,
													content_target_iab_category: n.content_target_iab_category,
												} ),
												( e.next = 3 ),
												fetch( ''.concat( ie, '/campaigns/' ).concat( i.campaign_id, '/ads' ), {
													method: 'POST',
													body: JSON.stringify( a ),
													headers: re,
												} )
											);
										case 3:
											return ( s = e.sent ), ( e.next = 6 ), s.json();
										case 6:
											if ( ( ( o = e.sent ), s.ok ) ) {
												e.next = 9;
												break;
											}
											throw new Error( 'Creating ad failed' );
										case 9:
											return e.abrupt( 'return', o );
										case 10:
										case 'end':
											return e.stop();
									}
							}, e );
						} )
					);
					return function ( t, n, i, r ) {
						return e.apply( this, arguments );
					};
				} )(),
				ce = ( function () {
					var e = ( 0, v.Z )(
						( 0, A.Z )().mark( function e( t ) {
							var n;
							return ( 0, A.Z )().wrap( function ( e ) {
								for (;;)
									switch ( ( e.prev = e.next ) ) {
										case 0:
											return (
												( n = new FileReader() ).readAsDataURL( t ),
												e.abrupt(
													'return',
													new Promise( function ( e, t ) {
														( n.onloadend = function () {
															var t = n.result;
															e( t );
														} ),
															( n.onerror = function ( e ) {
																t( e );
															} );
													} )
												)
											);
										case 3:
										case 'end':
											return e.stop();
									}
							}, e );
						} )
					);
					return function ( t ) {
						return e.apply( this, arguments );
					};
				} )(),
				de = ( function () {
					var e = ( 0, v.Z )(
						( 0, A.Z )().mark( function e( t, n, i, r ) {
							var a, s, o, d, l, u;
							return ( 0, A.Z )().wrap( function ( e ) {
								for (;;)
									switch ( ( e.prev = e.next ) ) {
										case 0:
											return ( e.next = 2 ), fetch( t.imageUrl );
										case 2:
											return ( a = e.sent ), ( e.next = 5 ), a.blob();
										case 5:
											return ( s = e.sent ), ( e.next = 8 ), ce( s );
										case 8:
											return (
												( o = e.sent ),
												( d = {
													campaign_id: n.campaign_id,
													ad_id: i.ad_id,
													name: t.title,
													description: '',
													type: c.article,
													urn: r.urn,
													width: 300,
													height: 250,
													assets: [
														{
															mime_type: 'application/json',
															content: {
																title: t.title,
																snippet: t.snippet,
																clickUrl: t.clickUrl,
																imageUrl: 'assets://featured.jpg',
															},
														},
														{
															file_name: 'featured.jpg',
															mime_type: t.imageMimeType || '',
															content: o,
														},
													],
												} ),
												( e.next = 12 ),
												fetch(
													''
														.concat( ie, '/campaigns/' )
														.concat( n.campaign_id, '/ads/' )
														.concat( i.ad_id, '/creatives' ),
													{ method: 'POST', body: JSON.stringify( d ), headers: re }
												)
											);
										case 12:
											if ( ( l = e.sent ).ok ) {
												e.next = 15;
												break;
											}
											throw new Error( 'Uploading assets failed' );
										case 15:
											return ( e.next = 17 ), l.json();
										case 17:
											return ( u = e.sent ), e.abrupt( 'return', u );
										case 19:
										case 'end':
											return e.stop();
									}
							}, e );
						} )
					);
					return function ( t, n, i, r ) {
						return e.apply( this, arguments );
					};
				} )(),
				le = ( function () {
					var e = ( 0, v.Z )(
						( 0, A.Z )().mark( function e( t ) {
							var n, i;
							return ( 0, A.Z )().wrap( function ( e ) {
								for (;;)
									switch ( ( e.prev = e.next ) ) {
										case 0:
											return (
												( e.next = 2 ),
												fetch( ''.concat( ie, '/campaigns/' ).concat( t.campaign_id, '/submit' ), {
													method: 'POST',
													body: JSON.stringify( {} ),
													headers: re,
												} )
											);
										case 2:
											return ( n = e.sent ), ( e.next = 5 ), n.json();
										case 5:
											if ( ( ( i = e.sent ), n.ok ) ) {
												e.next = 8;
												break;
											}
											throw new Error( 'Submitting for approval failed' );
										case 8:
											return e.abrupt( 'return', i );
										case 9:
										case 'end':
											return e.stop();
									}
							}, e );
						} )
					);
					return function ( t ) {
						return e.apply( this, arguments );
					};
				} )(),
				ue = ( 0, G.hg )(
					'adBuilder/createFullCampaign',
					( function () {
						var e = ( 0, v.Z )(
							( 0, A.Z )().mark( function e( t, n ) {
								var i, r, a, s, o, c, d, l, u;
								return ( 0, A.Z )().wrap(
									function ( e ) {
										for (;;)
											switch ( ( e.prev = e.next ) ) {
												case 0:
													return (
														( i = t.ad ),
														( r = t.article ),
														( a = t.widgetParams ),
														( e.prev = 1 ),
														( e.next = 4 ),
														se( r, i )
													);
												case 4:
													return ( s = e.sent ), ( e.next = 7 ), n.dispatch( Pe( ! 0 ) );
												case 7:
													return (
														console.warn( 'created campaign', s ), ( e.next = 10 ), oe( r, i, s, a )
													);
												case 10:
													return ( o = e.sent ), ( e.next = 13 ), n.dispatch( ke( ! 0 ) );
												case 13:
													return console.warn( 'created ad', o ), ( e.next = 16 ), de( r, s, o, a );
												case 16:
													return ( c = e.sent ), ( e.next = 19 ), n.dispatch( De( ! 0 ) );
												case 19:
													return console.warn( 'creative response', c ), ( e.next = 22 ), le( s );
												case 22:
													return ( d = e.sent ), ( e.next = 25 ), n.dispatch( Oe( ! 0 ) );
												case 25:
													return (
														console.warn( 'submit response', d ),
														( e.next = 28 ),
														n.dispatch(
															V.util.invalidateTags( [ 'Creatives', 'Ads', 'Campaigns' ] )
														)
													);
												case 28:
													return ( e.next = 30 ), n.dispatch( Ue( s.campaign_id ) );
												case 30:
													return e.abrupt( 'return', {
														campaign: s,
														ad: o,
														creative: c,
														submit: d,
													} );
												case 33:
													if (
														( ( e.prev = 33 ),
														( e.t0 = e.catch( 1 ) ),
														console.error( 'error creating campaign', e.t0 ),
														! Object.hasOwnProperty.call( e.t0, 'message' ) )
													) {
														e.next = 40;
														break;
													}
													return (
														( l = e.t0 ), ( u = l.message ), ( e.next = 40 ), n.dispatch( Le( u ) )
													);
												case 40:
												case 'end':
													return e.stop();
											}
									},
									e,
									null,
									[ [ 1, 33 ] ]
								);
							} )
						);
						return function ( t, n ) {
							return e.apply( this, arguments );
						};
					} )()
				),
				pe = ( 0, G.oM )( {
					name: 'adBuilder',
					initialState: ne,
					reducers: {
						setWidgetParams: function ( e, t ) {
							var n;
							( e.widgetParams = t.payload ),
								( function ( e ) {
									var t =
											e.apiHost ||
											{
												NODE_ENV: 'production',
												PUBLIC_URL: '',
												WDS_SOCKET_HOST: void 0,
												WDS_SOCKET_PATH: void 0,
												WDS_SOCKET_PORT: void 0,
												FAST_REFRESH: ! 0,
												REACT_APP_BUILD_TARGET: 'widget',
											}.REACT_APP_DSP_API_HOST ||
											'',
										n =
											e.apiPrefix ||
											{
												NODE_ENV: 'production',
												PUBLIC_URL: '',
												WDS_SOCKET_HOST: void 0,
												WDS_SOCKET_PATH: void 0,
												WDS_SOCKET_PORT: void 0,
												FAST_REFRESH: ! 0,
												REACT_APP_BUILD_TARGET: 'widget',
											}.REACT_APP_DSP_API_PREFIX ||
											'';
									ie = ''.concat( t ).concat( n ).concat( Y );
								} )( e.widgetParams ),
								( n = e.widgetParams.authToken ) &&
									( n.startsWith( 'rlt-' )
										? ( re.Authorization = 'X_WPCOM_RLT '.concat( n ) )
										: ( re.Authorization = 'Bearer '.concat( n ) ) );
						},
						setBuilderMode: function ( e, t ) {
							e.builderMode = t.payload;
						},
						setFormStep: function ( e, t ) {
							e.formStep = t.payload;
						},
						setGoalType: function ( e, t ) {
							e.ad.goal_type = t.payload;
						},
						setAdType: function ( e, t ) {
							e.ad.type = t.payload;
						},
						setTargetUrn: function ( e, t ) {
							e.ad.target_urn = t.payload;
						},
						setTargetSiteLanguages: function ( e, t ) {
							e.ad.content_target_language = t.payload;
						},
						setTargetLocations: function ( e, t ) {
							e.ad.user_target_geo = t.payload;
						},
						setDeviceTargetTypes: function ( e, t ) {
							e.ad.device_target_type = t.payload;
						},
						setTargetSiteTopics: function ( e, t ) {
							e.ad.content_target_iab_category = t.payload;
						},
						setAdStartDate: function ( e, t ) {
							e.ad.start_date = t.payload;
						},
						setAdEndDate: function ( e, t ) {
							e.ad.end_date = t.payload;
						},
						setAdBudgetCentsPerDay: function ( e, t ) {
							e.ad.budget_cents = t.payload;
						},
						setArticleTitle: function ( e, t ) {
							e.article.title = t.payload;
						},
						setArticleSnippet: function ( e, t ) {
							e.article.snippet = t.payload;
						},
						setArticleClickUrl: function ( e, t ) {
							e.article.clickUrl = t.payload;
						},
						setArticleImageUrl: function ( e, t ) {
							e.article.imageUrl = t.payload;
						},
						setArticleImageMimeType: function ( e, t ) {
							e.article.imageMimeType = t.payload;
						},
						setPaymentMethod: function ( e, t ) {
							e.paymentMethod = t.payload;
						},
						setNextButtonEnabled: function ( e, t ) {
							e.nextButtonEnabled = t.payload;
						},
						setCampaignCreated: function ( e, t ) {
							e.publishStatus.campaignCreated = t.payload;
						},
						setCampaignCreatedId: function ( e, t ) {
							e.publishStatus.campaignCreatedId = t.payload;
						},
						setAdCreated: function ( e, t ) {
							e.publishStatus.adCreated = t.payload;
						},
						setAssetsUploaded: function ( e, t ) {
							e.publishStatus.assetsUploaded = t.payload;
						},
						setSubmitted: function ( e, t ) {
							e.publishStatus.submitted = t.payload;
						},
						setCreateCampaignErrorMessage: function ( e, t ) {
							e.publishStatus.errorMessage = t.payload;
						},
					},
				} ),
				ge = pe.actions,
				me = ge.setFormStep,
				he = ( ge.setGoalType, ge.setAdType, ge.setTargetUrn ),
				fe = ge.setPaymentMethod,
				xe = ( ge.setBuilderMode, ge.setWidgetParams ),
				Ae = ge.setTargetSiteLanguages,
				ve = ge.setDeviceTargetTypes,
				ye = ge.setTargetSiteTopics,
				be = ge.setTargetLocations,
				Ce = ge.setAdStartDate,
				je = ge.setAdEndDate,
				Ze = ge.setAdBudgetCentsPerDay,
				Ee = ge.setNextButtonEnabled,
				_e = ge.setArticleTitle,
				Te = ge.setArticleSnippet,
				Se = ge.setArticleClickUrl,
				Be = ge.setArticleImageUrl,
				we = ge.setArticleImageMimeType,
				Pe = ge.setCampaignCreated,
				ke = ge.setAdCreated,
				De = ge.setAssetsUploaded,
				Oe = ge.setSubmitted,
				Ue = ge.setCampaignCreatedId,
				Le = ge.setCreateCampaignErrorMessage,
				qe = ( pe.reducer, n( 5021 ) ),
				Re = n( 6278 ),
				Ie = n( 7064 ),
				Me = n( 9900 ),
				Fe = n( 493 ),
				We = n( 8946 ),
				ze = n( 6378 ),
				He = {
					easing: { enter: 'linear', exit: 'inherit' },
					direction: 'left',
					mountOnEnter: ! 0,
					unmountOnExit: ! 0,
				},
				Ge = function () {
					var e = ( 0, h.v9 )( function ( e ) {
						return e.adBuilder.publishStatus.campaignCreatedId;
					} );
					return ( 0, U.jsxs )( U.Fragment, {
						children: [
							( 0, U.jsx )( D.Z, {
								variant: 'h2',
								sx: { mb: 2, mt: 0 },
								textAlign: 'center',
								children: '\ud83c\udf89',
							} ),
							( 0, U.jsx )( D.Z, {
								variant: 'h2',
								sx: { mb: 3 },
								textAlign: 'center',
								children: 'All set',
							} ),
							( 0, U.jsxs )( O.Z, {
								sx: { textAlign: 'center', mb: 2 },
								children: [
									( 0, U.jsx )( D.Z, {
										variant: 'h6',
										sx: { textAlign: 'center', mb: 2, display: 'inline-block', width: '550px' },
										textAlign: 'center',
										component: 'div',
										color: 'text.secondary',
										children: 'We will contact you shortly once we verify and run the ad',
									} ),
									( 0, U.jsx )( B.Z, {
										onClick: function ( t ) {
											fetch( 'api/v1/smart/campaigns/'.concat( e, '/create' ), { method: 'POST' } ),
												( t.target.textContent = 'Campaign sent to smart' );
										},
										children: 'Debug: Send campaign to Smart',
									} ),
								],
							} ),
						],
					} );
				},
				Ne = function ( e ) {
					var t = e.status,
						n = e.title;
					return ( 0, U.jsx )( qe.ZP, {
						children: ( 0, U.jsxs )( Re.Z, {
							children: [
								( 0, U.jsx )( Ie.Z, {
									children: t
										? ( 0, U.jsx )( We.Z, { color: 'success' } )
										: ( 0, U.jsx )( ze.Z, {} ),
								} ),
								( 0, U.jsx )( Me.Z, { primary: n } ),
							],
						} ),
					} );
				},
				Ke = function ( e ) {
					var t = e.status;
					return ( 0, U.jsx )( U.Fragment, {
						children: ( 0, U.jsxs )( Fe.Z, {
							children: [
								( 0, U.jsx )( Ne, { status: t.campaignCreated, title: 'Campaign Created' } ),
								( 0, U.jsx )( Ne, { status: t.adCreated, title: 'Ad Created' } ),
								( 0, U.jsx )( Ne, { status: t.assetsUploaded, title: 'Assets Uploaded' } ),
								( 0, U.jsx )( Ne, { status: t.submitted, title: 'Submitted for Approval' } ),
							],
						} ),
					} );
				},
				Qe = ( 0, h.$j )( function ( e ) {
					return {
						paymentMethod: e.adBuilder.paymentMethod,
						ad: e.adBuilder.ad,
						formStep: e.adBuilder.formStep,
						publishStatus: e.adBuilder.publishStatus,
					};
				}, {} )( function ( e ) {
					e.ad;
					var t = e.publishStatus,
						n = t.errorMessage,
						i = t.campaignCreated && t.adCreated && t.assetsUploaded && t.submitted;
					return ( 0,
					U.jsx )( k.Z, ( 0, P.Z )( ( 0, P.Z )( { in: ! 0 }, He ), {}, { children: ( 0, U.jsxs )( C.ZP, { container: ! 0, children: [ ( 0, U.jsx )( C.ZP, { item: ! 0, xs: 12, children: n && ( 0, U.jsx )( _.Z, { severity: 'error', children: n } ) } ), ( 0, U.jsx )( C.ZP, { item: ! 0, xs: 12, sx: { ml: { lg: 32, md: 32 } }, children: ( 0, U.jsx )( Ke, { status: t } ) } ), ( 0, U.jsx )( C.ZP, { item: ! 0, xs: 12, children: i && ( 0, U.jsx )( Ge, {} ) } ) ] } ) } ) );
				} ),
				Ye = n( 9221 ),
				Ve = n( 7391 ),
				Je = function ( e ) {
					var t = e.title;
					return ( 0, U.jsx )( C.ZP, {
						item: ! 0,
						xs: 12,
						children: ( 0, U.jsx )( D.Z, { align: 'center', variant: 'h6', children: t } ),
					} );
				},
				$e = n( 5987 ),
				Xe = n( 8829 ),
				et = n( 1652 ),
				tt = [ 'children', 'utils' ],
				nt = function ( e ) {
					var t = e.children,
						n = ( e.utils, ( 0, $e.Z )( e, tt ) );
					return ( 0, U.jsx )(
						et._,
						( 0, P.Z )( ( 0, P.Z )( { dateAdapter: Xe.Z }, n ), {}, { children: t } )
					);
				},
				it = function ( e ) {
					var t = document.createElement( 'div' );
					return ( t.innerHTML = e ), t.textContent || t.innerText || '';
				},
				rt = function ( e ) {
					var t = arguments.length > 1 && void 0 !== arguments[ 1 ] ? arguments[ 1 ] : '$',
						n = ( e / 100 ).toFixed( 2 );
					return '$' === t ? ''.concat( t ).concat( n ) : ''.concat( n ).concat( t );
				},
				at = n( 9831 ),
				st = n( 7261 ),
				ot = {
					easing: { enter: 'linear', exit: 'inherit' },
					direction: 'left',
					mountOnEnter: ! 0,
					unmountOnExit: ! 0,
				},
				ct = function ( e ) {
					e.onClickPrevious, e.onSubmit;
					var t = e.startDate,
						n = e.endDate,
						i = e.dailyBudgetInCents,
						r = e.setAdStartDate,
						a = e.setAdEndDate,
						s = e.setAdBudgetCentsPerDay;
					return ( 0, U.jsx )(
						k.Z,
						( 0, P.Z )(
							( 0, P.Z )( { in: ! 0 }, ot ),
							{},
							{
								children: ( 0, U.jsx )( C.ZP, {
									container: ! 0,
									children: ( 0, U.jsx )( C.ZP, {
										container: ! 0,
										spacing: 2,
										children: ( 0, U.jsxs )( nt, {
											children: [
												( 0, U.jsx )( Je, { title: 'Daily Budget' } ),
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 12,
													children: ( 0, U.jsx )( D.Z, {
														variant: 'subtitle1',
														align: 'center',
														children: 'Typically $5/day yields about 50 new visitors',
													} ),
												} ),
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 12,
													children: ( 0, U.jsxs )( D.Z, {
														variant: 'h4',
														textAlign: 'center',
														children: [ rt( i ), ' / day' ],
													} ),
												} ),
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 12,
													sx: { ml: '20%', mr: '20%' },
													children: ( 0, U.jsx )(
														Ye.ZP,
														{
															step: 25,
															min: 0,
															max: 5e3,
															'aria-label': 'Volume',
															value: i,
															onChange: function ( e, t ) {
																s( t );
															},
														},
														'budget'
													),
												} ),
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 6,
													children: ( 0, U.jsx )( st.M, {
														PopperProps: { disablePortal: ! 0 },
														onChange: function ( e, t ) {
															var i = e.toISOString();
															r( i ), n && e > ( 0, at.Z )( n ) && a( i );
														},
														disablePast: ! 0,
														label: 'Start Date',
														value: t,
														InputProps: { fullWidth: ! 0 },
														renderInput: function ( e ) {
															return ( 0, U.jsx )(
																Ve.Z,
																( 0, P.Z )( ( 0, P.Z )( {}, e ), {}, { fullWidth: ! 0 } )
															);
														},
													} ),
												} ),
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 6,
													children: ( 0, U.jsx )( st.M, {
														PopperProps: { disablePortal: ! 0 },
														disablePast: ! 0,
														onChange: function ( e, t ) {
															a( e.toISOString() );
														},
														value: n,
														minDate: ( 0, at.Z )( t ),
														label: 'End Date',
														renderInput: function ( e ) {
															return ( 0, U.jsx )(
																Ve.Z,
																( 0, P.Z )( ( 0, P.Z )( {}, e ), {}, { fullWidth: ! 0 } )
															);
														},
													} ),
												} ),
											],
										} ),
									} ),
								} ),
							}
						)
					);
				},
				dt = n( 4925 ),
				lt = n( 3967 ),
				ut = n( 8029 ),
				pt = n( 3786 ),
				gt = n( 8096 ),
				mt = n( 7198 ),
				ht = { PaperProps: { style: { maxHeight: 224, width: 250 } }, disablePortal: ! 0 };
			function ft( e, t, n ) {
				return {
					fontWeight:
						0 === t.length || -1 === t.indexOf( e )
							? n.typography.fontWeightRegular
							: n.typography.fontWeightMedium,
				};
			}
			function xt( e ) {
				var t = e.onChange,
					n = e.values,
					i = e.options,
					r = e.label,
					a = e.placeholder,
					s = ( 0, lt.Z )(),
					o = 'multiple-name-'.concat( r );
				return ( 0, U.jsx )( 'div', {
					children: ( 0, U.jsxs )( gt.Z, {
						sx: { m: 0, width: 1 },
						children: [
							( 0, U.jsx )( dt.Z, { id: o, children: r } ),
							( 0, U.jsx )( mt.Z, {
								labelId: o,
								id: 'multiple-'.concat( r ),
								multiple: ! 0,
								value: n,
								onChange: function ( e ) {
									var n = e.target.value;
									t( 'string' === typeof n ? n.split( ',' ) : n );
								},
								input: ( 0, U.jsx )( ut.Z, { label: r } ),
								displayEmpty: ! 0,
								MenuProps: ht,
								renderValue: function ( e ) {
									return 0 === e.length
										? ( 0, U.jsx )( 'em', { children: a } )
										: e
												.map( function ( e ) {
													var t;
													return null ===
														( t = i.find( function ( t ) {
															return t.value === e;
														} ) ) || void 0 === t
														? void 0
														: t.text;
												} )
												.join( ', ' );
								},
								children: i.map( function ( e ) {
									return ( 0,
									U.jsx )( pt.Z, { value: e.value, style: ft( e.value, n, s ), children: e.text }, ''.concat( r, '-' ).concat( e.value ) );
								} ),
							} ),
						],
					} ),
				} );
			}
			var At,
				vt = n( 3239 ),
				yt = {
					easing: { enter: 'linear', exit: 'inherit' },
					direction: 'left',
					mountOnEnter: ! 0,
					unmountOnExit: ! 0,
				},
				bt = {
					setTargetSiteLanguages: Ae,
					setTargetSiteTopics: ye,
					setTargetLocations: be,
					setDeviceTargetTypes: ve,
				},
				Ct = ( 0, h.$j )( function ( e ) {
					return {
						selectedLanguages: e.adBuilder.ad.content_target_language,
						selectedTopics: e.adBuilder.ad.content_target_iab_category,
						selectedLocations: e.adBuilder.ad.user_target_geo,
						selectedDevices: e.adBuilder.ad.device_target_type,
					};
				}, bt )( function ( e ) {
					var t = e.selectedLanguages,
						n = e.selectedTopics,
						i = e.selectedLocations,
						r = e.selectedDevices,
						a = e.setTargetSiteLanguages,
						s = e.setDeviceTargetTypes,
						o = e.setTargetSiteTopics,
						c = e.setTargetLocations,
						d = ( e.onSiteTargetingSelected, e.onClickPrevious, X() ),
						l = d.data,
						u = d.isFetching,
						g = ee(),
						m = g.data,
						h = g.isFetching,
						f = te(),
						x = f.data,
						A = f.isFetching,
						v = ( u ? [] : null !== l && void 0 !== l ? l : [] ).map( function ( e ) {
							return { value: e.id, text: e.text };
						} ),
						y = A ? [] : null !== x && void 0 !== x ? x : [],
						b = ( h ? [] : null !== m && void 0 !== m ? m : [] ).map( function ( e ) {
							return { value: e.code, text: e.text };
						} ),
						j = y.map( function ( e ) {
							return { value: e.id, text: e.text };
						} ),
						Z = [
							{ text: 'Desktop', value: p.desktop },
							{ text: 'Mobile', value: p.mobile },
							{ text: 'Tablet', value: p.tablet },
						];
					return ( 0,
					U.jsx )( k.Z, ( 0, P.Z )( ( 0, P.Z )( { in: ! 0 }, yt ), {}, { children: ( 0, U.jsxs )( C.ZP, { container: ! 0, spacing: 2, children: [ ( 0, U.jsxs )( C.ZP, { item: ! 0, xs: 12, children: [ ( 0, U.jsx )( D.Z, { variant: 'h3', children: 'Location' } ), ( 0, U.jsx )( D.Z, { variant: 'subtitle2', children: 'Where do you want to promote your post?' } ), ( 0, U.jsx )( dt.Z, { sx: { mt: 2 }, children: 'Country' } ), h ? ( 0, U.jsx )( vt.Z, {} ) : ( 0, U.jsx )( xt, { values: null !== i && void 0 !== i ? i : [], options: j, onChange: c, placeholder: 'All' } ) ] } ), ( 0, U.jsxs )( C.ZP, { item: ! 0, xs: 12, children: [ ( 0, U.jsx )( dt.Z, { children: 'Language' } ), h ? ( 0, U.jsx )( vt.Z, {} ) : ( 0, U.jsx )( xt, { values: null !== t && void 0 !== t ? t : [], options: v, onChange: a, placeholder: 'All' } ) ] } ), ( 0, U.jsx )( C.ZP, { item: ! 0, xs: 12, children: u ? ( 0, U.jsx )( vt.Z, {} ) : ( 0, U.jsxs )( U.Fragment, { children: [ ( 0, U.jsx )( dt.Z, { id: 'interests', children: 'Interests' } ), ( 0, U.jsx )( D.Z, { variant: 'subtitle2', children: 'Add a broad range of interests as tags.' } ), ( 0, U.jsx )( xt, { values: null !== n && void 0 !== n ? n : [], options: b, onChange: o, placeholder: 'All' } ) ] } ) } ), ( 0, U.jsxs )( C.ZP, { item: ! 0, xs: 12, children: [ ( 0, U.jsx )( dt.Z, { id: 'devices', children: 'Devices' } ), ( 0, U.jsx )( xt, { values: null !== r && void 0 !== r ? r : [], options: Z, onChange: s, placeholder: 'All' } ) ] } ) ] } ) } ) );
				} ),
				jt = n( 7317 ),
				Zt = n( 3208 ),
				Et = n( 7482 );
			! ( function ( e ) {
				( e[ ( e.default = 0 ) ] = 'default' ), ( e[ ( e.linear = 1 ) ] = 'linear' );
			} )( At || ( At = {} ) );
			var _t = function ( e ) {
					var t = e.type,
						n = void 0 === t ? At.default : t,
						i = e.showText,
						r = void 0 !== i && i,
						a = e.size,
						s = e.centered,
						o =
							n === At.default
								? ( 0, U.jsx )( vt.Z, { size: a } )
								: ( 0, U.jsx )( Et.Z, { style: { width: a || 30 } } );
					return ( 0, U.jsxs )( 'div', {
						style: ( 0, P.Z )(
							( 0, P.Z )( { display: 'flex', height: '100%' }, s && { alignItems: 'center' } ),
							{},
							{ justifyContent: 'center', margin: '0 10px 0 10px' }
						),
						children: [
							o,
							( 0, U.jsx )( 'span', {
								style: { marginLeft: ''.concat( ( a || 30 ) / 2, 'px' ) },
								children: r && 'Loading...',
							} ),
						],
					} );
				},
				Tt = n( 8310 ),
				St = n.n( Tt ),
				Bt = n( 7621 ),
				wt = n( 427 ),
				Pt = n( 7596 ),
				kt = n( 6181 ),
				Dt = n.n( kt ),
				Ot = function ( e ) {
					var t = e.onUpload,
						n = e.buttonText,
						i = e.name;
					return ( 0, U.jsxs )( U.Fragment, {
						children: [
							( 0, U.jsx )( 'input', {
								id: 'contained-button-file',
								accept: 'image/x-png,image/jpeg,image/gif',
								onChange: function ( e ) {
									var n = Dt()( e, 'target.files[0]' );
									if ( n ) {
										var i = new FormData();
										i.append( 'image', n );
										var r = window.URL.createObjectURL( n );
										t( i, n, r );
									}
								},
								style: { display: 'none' },
								name: i,
								type: 'file',
							} ),
							( 0, U.jsx )( 'label', {
								htmlFor: 'contained-button-file',
								children: ( 0, U.jsx )( B.Z, {
									variant: 'contained',
									color: 'primary',
									component: 'span',
									children: n || 'Upload',
								} ),
							} ),
						],
					} );
				},
				Ut = n( 1134 ),
				Lt = ( 0, n( 6934 ).ZP )( j.Z )( function () {
					return {
						width: 400,
						'& form': { minHeight: '100%', display: 'flex', flexDirection: 'column' },
						'& .upload-dropper': {
							marginTop: '20px',
							padding: '20px',
							border: '#ccc thick dashed',
							borderRadius: '20px',
							'> div': {
								width: '300px',
								height: '140px',
								backgroundSize: 'cover',
								backgroundPosition: '50% 50%',
							},
						},
					};
				} ),
				qt = function ( e ) {
					var t = e.onSuccess,
						n = e.onClose,
						i = e.dialogContainer,
						r = ( 0, g.useState )( '' ),
						a = ( 0, x.Z )( r, 2 ),
						s = a[ 0 ],
						o = a[ 1 ],
						c = ( 0, g.useState )(),
						d = ( 0, x.Z )( c, 2 ),
						l = d[ 0 ],
						u = d[ 1 ],
						p = ( 0, g.useState )( '' ),
						m = ( 0, x.Z )( p, 2 ),
						h = m[ 0 ],
						f = m[ 1 ],
						A = ( 0, Ut.cI )( { defaultValues: { image: void 0 } } ),
						v = function ( e, t ) {
							u( window.URL.createObjectURL( t ) ), f( t.type );
						};
					return ( 0, U.jsx )( y.Z, {
						open: ! 0,
						onClose: n,
						'aria-labelledby': 'alert-dialog-title',
						'aria-describedby': 'alert-dialog-description',
						maxWidth: ! 1,
						container: i,
						children: ( 0, U.jsx )( Lt, {
							children: ( 0, U.jsxs )( Pt.Yb, {
								FormProps: { encType: 'multipart/form-data' },
								formContext: A,
								onSuccess: function () {
									l && t( l, h );
								},
								children: [
									( 0, U.jsx )( b.Z, {
										id: 'alert-dialog-title',
										children: ( 0, U.jsxs )( C.ZP, {
											container: ! 0,
											children: [
												( 0, U.jsx )( C.ZP, { item: ! 0, xs: 6, children: 'Upload Creative' } ),
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 6,
													children: ( 0, U.jsx )( j.Z, {
														display: 'flex',
														justifyContent: 'flex-end',
														children: ( 0, U.jsx )( Z.Z, {
															'aria-label': 'close',
															onClick: n,
															sx: {
																position: 'absolute',
																right: 8,
																top: 8,
																color: function ( e ) {
																	return e.palette.grey[ 500 ];
																},
															},
															children: ( 0, U.jsx )( w.Z, {} ),
														} ),
													} ),
												} ),
											],
										} ),
									} ),
									( 0, U.jsxs )( E.Z, {
										children: [
											s &&
												( 0, U.jsx )( _.Z, {
													severity: 'error',
													onClose: function () {
														return o( '' );
													},
													children: s,
												} ),
											( 0, U.jsxs )( 'div', {
												style: { textAlign: 'center' },
												children: [
													l &&
														( 0, U.jsx )( Ot, {
															name: 'image',
															buttonText: 'Choose another image',
															onUpload: v,
														} ),
													( 0, U.jsx )( j.Z, {
														className: 'upload-dropper',
														onDragOver: function ( e ) {
															return ( function ( e ) {
																e.preventDefault();
															} )( e );
														},
														onDrop: function ( e ) {
															return ( function ( e ) {
																var t, n;
																if (
																	( e.stopPropagation(),
																	e.preventDefault(),
																	( null === ( t = e.dataTransfer ) || void 0 === t
																		? void 0
																		: t.files.length ) > 1 )
																)
																	o( 'Please select only one image' );
																else {
																	var i =
																		null === ( n = e.dataTransfer ) || void 0 === n
																			? void 0
																			: n.files[ 0 ];
																	u( window.URL.createObjectURL( i ) ), f( i.type );
																}
															} )( e );
														},
														children: l
															? ( 0, U.jsx )( 'div', {
																	style: { backgroundImage: 'url("'.concat( l, '")' ) },
															  } )
															: ( 0, U.jsxs )( j.Z, {
																	pt: 10,
																	children: [
																		( 0, U.jsx )( D.Z, {
																			sx: { mb: 1 },
																			textAlign: 'center',
																			children: 'Drag a file here or click to',
																		} ),
																		( 0, U.jsx )( Ot, { name: 'image', onUpload: v } ),
																	],
															  } ),
													} ),
												],
											} ),
										],
									} ),
									( 0, U.jsx )( S.Z, {
										children: ( 0, U.jsx )( B.Z, {
											type: 'submit',
											variant: 'contained',
											color: 'primary',
											children: 'Create',
										} ),
									} ),
								],
							} ),
						} ),
					} );
				},
				Rt = function ( e ) {
					var t = e.onUpload,
						n = g.useState( ! 1 ),
						i = ( 0, x.Z )( n, 2 ),
						r = i[ 0 ],
						a = i[ 1 ],
						s = ( 0, g.useRef )( null );
					return ( 0, U.jsxs )( U.Fragment, {
						children: [
							( 0, U.jsx )( 'div', { ref: s } ),
							( 0, U.jsxs )( St(), {
								flipDirection: 'horizontal',
								children: [
									( 0, U.jsx )( j.Z, {
										children: ( 0, U.jsx )( B.Z, {
											variant: 'contained',
											color: 'primary',
											onClick: function () {
												return a( ! 0 );
											},
											children: 'Replace image',
										} ),
									} ),
									( 0, U.jsx )( Bt.Z, {
										sx: { backgroundColor: wt.Z[ 50 ], padding: '50px 0', textAlign: 'center' },
										children:
											r &&
											( 0, U.jsx )( qt, {
												onClose: function () {
													return a( ! 1 );
												},
												onSuccess: function ( e, n ) {
													a( ! 1 ), t && t( e, n );
												},
												dialogContainer: function () {
													return s.current;
												},
											} ),
									} ),
								],
							} ),
						],
					} );
				},
				It = n( 5701 ),
				Mt = n.n( It ),
				Ft = n( 8236 ),
				Wt = n.n( Ft ),
				zt = n( 6850 ),
				Ht = n.n( zt ),
				Gt = n( 7182 ),
				Nt = n.n( Gt ),
				Kt = n( 9213 ),
				Qt = n.n( Kt ),
				Yt = n( 4398 ),
				Vt = {};
			( Vt.styleTagTransform = Qt() ),
				( Vt.setAttributes = Ht() ),
				( Vt.insert = function ( e ) {
					window._dsp_widget_styles || ( window._dsp_widget_styles = [] ),
						window._dsp_widget_styles.push( e );
					var t = 10;
					! ( function n() {
						if ( t-- > 0 ) {
							var i = null;
							e.innerHTML.includes( '@font-face' )
								? ( i = document.querySelector( 'head' ) )
								: ( i = document.querySelector( '#wpcom-dsp-widget-shadow-dom' ) ) &&
								  ( i = i.shadowRoot ),
								i ? i.prepend( e ) : setTimeout( n, 10 );
						}
					} )();
				} ),
				( Vt.domAPI = Wt() ),
				( Vt.insertStyleElement = Nt() );
			Mt()( Yt.Z, Vt ), Yt.Z && Yt.Z.locals && Yt.Z.locals;
			var Jt = n( 7063 ),
				$t = {};
			( $t.styleTagTransform = Qt() ),
				( $t.setAttributes = Ht() ),
				( $t.insert = function ( e ) {
					window._dsp_widget_styles || ( window._dsp_widget_styles = [] ),
						window._dsp_widget_styles.push( e );
					var t = 10;
					! ( function n() {
						if ( t-- > 0 ) {
							var i = null;
							e.innerHTML.includes( '@font-face' )
								? ( i = document.querySelector( 'head' ) )
								: ( i = document.querySelector( '#wpcom-dsp-widget-shadow-dom' ) ) &&
								  ( i = i.shadowRoot ),
								i ? i.prepend( e ) : setTimeout( n, 10 );
						}
					} )();
				} ),
				( $t.domAPI = Wt() ),
				( $t.insertStyleElement = Nt() );
			Mt()( Jt.Z, $t ), Jt.Z && Jt.Z.locals && Jt.Z.locals;
			var Xt = function ( e ) {
					var t = e.children;
					return ( 0, U.jsx )( 'div', {
						style: {
							width: '300px',
							boxShadow:
								'rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset',
						},
						children: t,
					} );
				},
				en = function ( e ) {
					return ( 0, U.jsx )( 'div', { className: 'ad-container', children: e.children } );
				},
				tn = function ( e ) {
					return ( 0, U.jsx )( 'div', {
						className: 'ad-snippet',
						children: ( 0, U.jsx )( 'p', { children: e.snippet } ),
					} );
				},
				nn = function ( e ) {
					return ( 0, U.jsx )( 'div', {
						className: 'ad-image',
						children: e.imageUrl
							? ( 0, U.jsx )( 'img', {
									style: { width: '100%' },
									src: e.imageUrl,
									alt: ''.concat( e.title, ' image' ),
							  } )
							: ( 0, U.jsxs )( 'div', {
									className: 'no-image',
									children: [
										'\ud83c\udfde',
										( 0, U.jsx )( 'br', {} ),
										( 0, U.jsx )( 'br', {} ),
										'Please upload an image',
									],
							  } ),
					} );
				},
				rn = function ( e ) {
					return ( 0, U.jsxs )( 'div', {
						className: 'ad-header',
						children: [
							( 0, U.jsx )( 'div', { className: 'ad-header-title', style: {}, children: e.title } ),
							( 0, U.jsx )( 'div', { className: 'ad-header-subtitle', children: 'Sponsored' } ),
						],
					} );
				},
				an = function ( e ) {
					return ( 0, U.jsxs )( en, {
						children: [
							( 0, U.jsx )( rn, ( 0, P.Z )( {}, e ) ),
							( 0, U.jsx )( nn, ( 0, P.Z )( {}, e ) ),
							( 0, U.jsx )( tn, ( 0, P.Z )( {}, e ) ),
						],
					} );
				},
				sn = n( 763 ),
				on = n.n( sn ),
				cn = {
					easing: { enter: 'linear', exit: 'inherit' },
					direction: 'left',
					mountOnEnter: ! 0,
					unmountOnExit: ! 0,
				},
				dn = ( 0, h.$j )( function ( e ) {
					return { article: e.adBuilder.article, urn: e.adBuilder.widgetParams.urn };
				} )( function ( e ) {
					var t = e.urn,
						n = e.article,
						i = ( function ( e ) {
							return e
								? { siteId: +e.split( ':' )[ 3 ], postId: +e.split( ':' )[ 4 ] }
								: { siteId: 0, postId: 0 };
						} )( t ),
						r = i.postId,
						a = i.siteId,
						s = ( 0, g.useState )( ! 1 ),
						o = ( 0, x.Z )( s, 2 ),
						c = o[ 0 ],
						d = o[ 1 ],
						l = ( 0, h.I0 )(),
						u = $( { post_id: r, site_id: a } ),
						p = u.data,
						m = u.error,
						f = u.isLoading,
						y = ( 0, Ut.cI )( { mode: 'all' } ),
						b = y.setValue,
						Z = y.formState.errors,
						E = on().isEmpty( Z );
					if (
						( ( 0, g.useEffect )(
							function () {
								l( Ee( E ) );
							},
							[ Z, E ]
						),
						( 0, g.useEffect )(
							function () {
								var e = ( function () {
									var e = ( 0, v.Z )(
										( 0, A.Z )().mark( function e() {
											var t, n, i, r, a, s;
											return ( 0, A.Z )().wrap( function ( e ) {
												for (;;)
													switch ( ( e.prev = e.next ) ) {
														case 0:
															if ( ! p ) {
																e.next = 17;
																break;
															}
															if (
																( ( t = p.title ),
																( n = p.excerpt ),
																( i = p.URL ),
																null === ( r = p.post_thumbnail ) || void 0 === r || ! r.URL )
															) {
																e.next = 7;
																break;
															}
															return ( e.next = 5 ), ae( r.URL );
														case 5:
															( s = e.sent ) && ( a = window.URL.createObjectURL( s ) );
														case 7:
															d( ! 0 ),
																b( 'title', t ),
																b( 'snippet', it( n ) ),
																b( 'url', i ),
																l(
																	Be( a || ( null === r || void 0 === r ? void 0 : r.URL ) || '' )
																),
																l(
																	we( ( null === r || void 0 === r ? void 0 : r.mime_type ) || '' )
																),
																l( _e( t ) ),
																l( Te( it( n ) ) ),
																l( Se( i ) ),
																l( Ee( ! 0 ) );
														case 17:
														case 'end':
															return e.stop();
													}
											}, e );
										} )
									);
									return function () {
										return e.apply( this, arguments );
									};
								} )();
								e();
							},
							[ l, b, p ]
						),
						f || ! n )
					)
						return ( 0, U.jsx )( _t, { centered: ! 0 } );
					if ( m ) {
						var T = null;
						if ( 'status' in m ) {
							var S = m.data;
							T =
								'error' in m
									? m.error
									: 'errorMessage' in S
									? S.errorMessage
									: JSON.stringify( m.data );
						} else T = m.message || 'Please reload the page and try again';
						return ( 0, U.jsxs )( _.Z, {
							severity: 'error',
							children: [ ( 0, U.jsx )( jt.Z, { children: 'There was an error' } ), T ],
						} );
					}
					return n
						? ( 0, U.jsx )(
								k.Z,
								( 0, P.Z )(
									( 0, P.Z )( { in: ! 0 }, cn ),
									{},
									{
										children: ( 0, U.jsxs )( C.ZP, {
											container: ! 0,
											children: [
												( 0, U.jsx )( Je, { title: "Let's customize the creative" } ),
												( 0, U.jsxs )( C.ZP, {
													container: ! 0,
													sx: { mt: 3 },
													children: [
														( 0, U.jsx )( C.ZP, {
															item: ! 0,
															xs: 6,
															children: c
																? ( 0, U.jsx )( Zt.Z, {
																		timeout: 1e3,
																		in: ! 0,
																		children: ( 0, U.jsx )( j.Z, {
																			children: ( 0, U.jsx )( Xt, {
																				children: ( 0, U.jsx )( an, ( 0, P.Z )( {}, n ) ),
																			} ),
																		} ),
																  } )
																: ( 0, U.jsx )( _t, { centered: ! 0 } ),
														} ),
														( 0, U.jsx )( C.ZP, {
															item: ! 0,
															xs: 6,
															sx: { pl: 2 },
															children: ( 0, U.jsxs )( Pt.Yb, {
																formContext: y,
																onSuccess: function () {},
																children: [
																	( 0, U.jsx )( Ve.Z, {
																		margin: 'normal',
																		label: 'Title',
																		name: 'title',
																		required: ! 0,
																		fullWidth: ! 0,
																		value: n.title,
																		onChange: function ( e ) {
																			l( _e( e.target.value ) );
																		},
																	} ),
																	( 0, U.jsx )( Ve.Z, {
																		margin: 'normal',
																		name: 'snippet',
																		label: 'Snippet',
																		required: ! 0,
																		multiline: ! 0,
																		fullWidth: ! 0,
																		rows: 2,
																		value: n.snippet,
																		onChange: function ( e ) {
																			l( Te( e.target.value ) );
																		},
																	} ),
																	( 0, U.jsx )( Ve.Z, {
																		margin: 'normal',
																		name: 'url',
																		label: 'Target Url',
																		required: ! 0,
																		fullWidth: ! 0,
																		value: n.clickUrl,
																		onChange: function ( e ) {
																			l( Se( e.target.value ) );
																		},
																	} ),
																	( 0, U.jsx )( j.Z, {
																		mt: 2,
																		children: ( 0, U.jsx )( Rt, {
																			onUpload: function ( e, t ) {
																				l( Be( e ) ), l( we( t ) ), Z || l( Ee( ! 0 ) );
																			},
																		} ),
																	} ),
																],
															} ),
														} ),
													],
												} ),
											],
										} ),
									}
								)
						  )
						: ( 0, U.jsx )( 'div', { children: 'Undefined object' } );
				} ),
				ln = n( 4721 ),
				un = function ( e ) {
					var t = e.value,
						n = e.label;
					return ( 0, U.jsxs )( U.Fragment, {
						children: [
							( 0, U.jsx )( qe.ZP, {
								alignItems: 'flex-start',
								children: ( 0, U.jsx )( Me.Z, {
									primary: n,
									secondary: ( 0, U.jsx )( g.Fragment, {
										children: ( 0, U.jsx )( D.Z, {
											sx: { display: 'inline' },
											component: 'span',
											variant: 'body2',
											color: 'text.primary',
											children: t,
										} ),
									} ),
								} ),
							} ),
							( 0, U.jsx )( ln.Z, { variant: 'inset', component: 'li' } ),
						],
					} );
				},
				pn = {
					easing: { enter: 'linear', exit: 'inherit' },
					direction: 'left',
					mountOnEnter: ! 0,
					unmountOnExit: ! 0,
				},
				gn = ( 0, h.$j )( function ( e ) {
					return {
						paymentMethod: e.adBuilder.paymentMethod,
						article: e.adBuilder.article,
						formStep: e.adBuilder.formStep,
					};
				}, {} )( function ( e ) {
					var t = e.article,
						n = e.paymentMethod;
					return ( 0,
					U.jsx )( k.Z, ( 0, P.Z )( ( 0, P.Z )( { in: ! 0 }, pn ), {}, { children: ( 0, U.jsxs )( C.ZP, { item: ! 0, xs: 12, children: [ ( 0, U.jsx )( D.Z, { variant: 'h4', sx: { mb: 2, mt: { sm: 2, lg: 0 } }, textAlign: 'center', children: "Let's review the ad \ud83d\udc4c" } ), ( 0, U.jsxs )( Fe.Z, { sx: { width: '100%', bgcolor: 'background.paper', overflow: ' auto' }, children: [ ( 0, U.jsx )( un, { value: t.clickUrl, label: 'Target URL' } ), ( 0, U.jsx )( un, { value: n, label: 'Payment Method' } ) ] } ), ( 0, U.jsx )( C.ZP, { container: ! 0, spacing: 0, direction: 'column', alignItems: 'center', sx: { mt: 3 }, children: ( 0, U.jsx )( C.ZP, { item: ! 0, xs: 4, children: ( 0, U.jsx )( Xt, { children: ( 0, U.jsx )( an, ( 0, P.Z )( {}, t ) ) } ) } ) } ) ] } ) } ) );
				} ),
				mn = n( 6154 ),
				hn =
					( n( 3929 ),
					function ( e ) {
						var t = e.stripeKey,
							n = ( 0, g.useRef )( null ),
							i = ( 0, g.useState )( ! 0 ),
							r = ( 0, x.Z )( i, 2 ),
							a = r[ 0 ],
							s = r[ 1 ],
							o = ( 0, g.useState )( null ),
							c = ( 0, x.Z )( o, 2 ),
							d = c[ 0 ],
							l = c[ 1 ],
							u = ( 0, g.useState )( null ),
							p = ( 0, x.Z )( u, 2 ),
							m = p[ 0 ],
							h = p[ 1 ],
							f = function ( e ) {
								console.warn( 'on change', e );
								var t = e.target;
								s( ! t.complete || t.empty );
							},
							y = function ( e ) {
								console.warn( 'on error', e ), h( e.detail || 'Unknown error' );
							},
							b = function ( e ) {
								console.warn( 'on token', e ), l( e.token );
							};
						( 0, g.useEffect )( function () {
							if ( n.current )
								return (
									n.current.addEventListener( 'change', f ),
									n.current.addEventListener( 'error', y ),
									n.current.addEventListener( 'token', b ),
									function () {
										n.current &&
											( n.current.removeEventListener( 'change', f ),
											n.current.removeEventListener( 'error', y ),
											n.current.removeEventListener( 'token', b ) );
									}
								);
						}, [] );
						var C = ( function () {
							var e = ( 0, v.Z )(
								( 0, A.Z )().mark( function e( t ) {
									var i;
									return ( 0, A.Z )().wrap( function ( e ) {
										for (;;)
											switch ( ( e.prev = e.next ) ) {
												case 0:
													if ( ! n.current ) {
														e.next = 5;
														break;
													}
													return ( e.next = 3 ), n.current.createToken();
												case 3:
													( i = e.sent ), l( i.token );
												case 5:
												case 'end':
													return e.stop();
											}
									}, e );
								} )
							);
							return function ( t ) {
								return e.apply( this, arguments );
							};
						} )();
						return ( 0, U.jsxs )( U.Fragment, {
							children: [
								( 0, U.jsx )( 'stripe-elements', { ref: n, 'publishable-key': t } ),
								( 0, U.jsx )( B.Z, {
									variant: 'contained',
									type: 'submit',
									disabled: a,
									onClick: C,
									startIcon: ( 0, U.jsx )( mn.Z, {} ),
									children: 'Pay',
								} ),
								d && ( 0, U.jsxs )( 'div', { children: [ 'Token: ', JSON.stringify( d ) ] } ),
								m && ( 0, U.jsxs )( 'div', { children: [ 'Error: ', JSON.stringify( m ) ] } ),
							],
						} );
					} ),
				fn = {
					easing: { enter: 'linear', exit: 'inherit' },
					direction: 'left',
					mountOnEnter: ! 0,
					unmountOnExit: ! 0,
				},
				xn = { setPaymentMethod: fe },
				An = ( 0, h.$j )( function ( e ) {
					return { stripeKey: e.adBuilder.widgetParams.stripeKey };
				}, xn )( function ( e ) {
					var t = e.stripeKey;
					return ( 0,
					U.jsx )( k.Z, ( 0, P.Z )( ( 0, P.Z )( { in: ! 0 }, fn ), {}, { children: ( 0, U.jsxs )( C.ZP, { container: ! 0, spacing: 2, children: [ ( 0, U.jsx )( Je, { title: 'Payment Details' } ), ( 0, U.jsx )( C.ZP, { item: ! 0, xs: 12, children: ( 0, U.jsx )( hn, { stripeKey: t } ) } ) ] } ) } ) );
				} ),
				vn = [
					u.intro,
					u.previewCreative,
					u.siteTargeting,
					u.budgetTiming,
					u.pay,
					u.confirmAd,
					u.finish,
				];
			function yn( e ) {
				var t = vn.indexOf( e );
				return vn[ t - 1 ];
			}
			function bn( e ) {
				var t = vn.indexOf( e );
				return vn[ t + 1 ];
			}
			var Cn = {
					setFormStep: me,
					createFullCampaignWidgetModeThunk: ue,
					setAdStartDate: Ce,
					setAdEndDate: je,
					setAdBudgetCentsPerDay: Ze,
					setNextButtonEnabled: Ee,
				},
				jn = ( 0, h.$j )( function ( e ) {
					return {
						formStep: e.adBuilder.formStep,
						dailyBudgetInCents: e.adBuilder.ad.budget_cents,
						startDate: e.adBuilder.ad.start_date,
						endDate: e.adBuilder.ad.end_date,
						adBuilder: e.adBuilder,
						nextButtonEnabled: e.adBuilder.nextButtonEnabled,
					};
				}, Cn )( function ( e ) {
					var t = e.formStep,
						n = e.setFormStep,
						i = e.onClose,
						r = e.onSuccess,
						a = e.startDate,
						s = e.endDate,
						o = e.dailyBudgetInCents,
						c = e.setAdStartDate,
						d = e.setAdEndDate,
						l = e.setAdBudgetCentsPerDay,
						p = e.nextButtonEnabled,
						m = e.createFullCampaignWidgetModeThunk,
						h = e.setNextButtonEnabled,
						f = e.adBuilder,
						P = e.dialogContainer,
						k = ( 0, g.useState )( '' ),
						D = ( 0, x.Z )( k, 2 ),
						O = D[ 0 ],
						L = D[ 1 ];
					return ( 0, U.jsxs )( y.Z, {
						container: P,
						open: ! 0,
						onClose: i,
						'aria-labelledby': 'alert-dialog-title',
						'aria-describedby': 'alert-dialog-description',
						fullWidth: ! 0,
						maxWidth: 'md',
						sx: {
							'& > .MuiDialog-container': {
								'& > .MuiPaper-root': {
									height: { xs: 'calc(100vh - 64px)', sm: '800px', lg: '800px' },
								},
							},
						},
						children: [
							t !== u.intro
								? ( 0, U.jsx )( b.Z, {
										sx: { mb: 2 },
										id: 'dialog-title',
										children: ( 0, U.jsxs )( C.ZP, {
											container: ! 0,
											children: [
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 6,
													children: ( 0, U.jsx )( j.Z, {
														display: 'flex',
														justifyContent: 'flex-end',
														children: ( 0, U.jsx )( Z.Z, {
															'aria-label': 'close',
															onClick: i,
															sx: {
																position: 'absolute',
																right: 8,
																top: 8,
																color: function ( e ) {
																	return e.palette.grey[ 500 ];
																},
															},
															children: ( 0, U.jsx )( w.Z, {} ),
														} ),
													} ),
												} ),
												( 0, U.jsx )( C.ZP, {
													item: ! 0,
													xs: 12,
													sx: { mt: 3 },
													children: ( 0, U.jsx )( H, { formStep: t } ),
												} ),
											],
										} ),
								  } )
								: ( 0, U.jsx )( C.ZP, {
										container: ! 0,
										children: ( 0, U.jsx )( C.ZP, {
											item: ! 0,
											xs: 12,
											children: ( 0, U.jsx )( j.Z, {
												display: 'flex',
												justifyContent: 'flex-end',
												children: ( 0, U.jsx )( Z.Z, {
													'aria-label': 'close',
													onClick: i,
													sx: {
														position: 'absolute',
														right: 8,
														top: 8,
														color: function ( e ) {
															return e.palette.grey[ 500 ];
														},
													},
													children: ( 0, U.jsx )( w.Z, {} ),
												} ),
											} ),
										} ),
								  } ),
							( 0, U.jsxs )( E.Z, {
								children: [
									O &&
										( 0, U.jsx )( _.Z, {
											severity: 'error',
											onClose: function () {
												return L( '' );
											},
											children: O,
										} ),
									( 0, U.jsxs )( T.Z, {
										sx: { overflow: 'hidden', height: '100%' },
										children: [
											t === u.intro &&
												( 0, U.jsx )( q, {
													onClickGetStarted: function () {
														n( u.previewCreative ), h( ! 1 );
													},
												} ),
											t === u.previewCreative && ( 0, U.jsx )( dn, {} ),
											t === u.siteTargeting &&
												( 0, U.jsx )( Ct, {
													onSiteTargetingSelected: function ( e ) {
														console.warn( 'selected site targeting', e ), n( u.budgetTiming );
													},
													onClickPrevious: function () {
														console.warn( 'clicked previous' ), n( u.previewCreative );
													},
												} ),
											t === u.budgetTiming &&
												( 0, U.jsx )( ct, {
													onSubmit: function ( e ) {
														console.warn( 'submit budget timing', e ), n( u.paymentMethod );
													},
													onClickPrevious: function () {
														console.warn( 'clicked previous' ), n( u.siteTargeting );
													},
													startDate: a,
													endDate: s,
													dailyBudgetInCents: o,
													setAdStartDate: c,
													setAdEndDate: d,
													setAdBudgetCentsPerDay: l,
												} ),
											t === u.pay && ( 0, U.jsx )( An, {} ),
											t === u.confirmAd && ( 0, U.jsx )( gn, {} ),
											t === u.finish && ( 0, U.jsx )( Qe, {} ),
										],
									} ),
								],
							} ),
							( 0, U.jsx )( S.Z, {
								sx: { flex: 'inherit' },
								children: ( 0, U.jsxs )( C.ZP, {
									container: ! 0,
									children: [
										( 0, U.jsx )( C.ZP, {
											item: ! 0,
											xs: 6,
											children:
												t !== u.intro &&
												t !== u.finish &&
												( 0, U.jsx )( B.Z, {
													color: 'secondary',
													disabled: void 0 === yn( t ),
													onClick: function () {
														n( yn( t ) );
													},
													children: 'Previous',
												} ),
										} ),
										( 0, U.jsx )( C.ZP, {
											item: ! 0,
											xs: 6,
											children: ( 0, U.jsxs )( j.Z, {
												display: 'flex',
												justifyContent: 'flex-end',
												children: [
													t === u.confirmAd &&
														( 0, U.jsx )( B.Z, {
															type: 'submit',
															variant: 'contained',
															color: 'primary',
															onClick: ( 0, v.Z )(
																( 0, A.Z )().mark( function e() {
																	var i;
																	return ( 0, A.Z )().wrap( function ( e ) {
																		for (;;)
																			switch ( ( e.prev = e.next ) ) {
																				case 0:
																					return n( bn( t ) ), ( e.next = 3 ), m( f );
																				case 3:
																					( i = e.sent ), r && r( i );
																				case 5:
																				case 'end':
																					return e.stop();
																			}
																	}, e );
																} )
															),
															children: 'Create',
														} ),
													void 0 !== bn( t ) &&
														t !== u.intro &&
														t !== u.confirmAd &&
														( 0, U.jsx )( B.Z, {
															variant: 'contained',
															color: 'primary',
															disabled: ! p,
															onClick: function () {
																n( bn( t ) );
															},
															children: 'Continue',
														} ),
												],
											} ),
										} ),
									],
								} ),
							} ),
						],
					} );
				} ),
				Zn = n( 76 ),
				En = n( 596 ),
				_n = n( 8185 ),
				Tn = n( 9311 ),
				Sn = '#264aef',
				Bn = '#757575',
				wn = '#1E1E1E',
				Pn = {
					primary: { main: Sn, light: Sn, dark: Sn },
					secondary: { main: Bn },
					text: { primary: wn, secondary: '#757575' },
				},
				kn = n( 115 ),
				Dn = [ 'href' ],
				On = g.forwardRef( function ( e, t ) {
					var n = e.href,
						i = ( 0, $e.Z )( e, Dn );
					return ( 0, U.jsx )( kn.rU, ( 0, P.Z )( { ref: t, to: n }, i ) );
				} ),
				Un = {
					components: {
						MuiButton: {
							styleOverrides: {
								root: { borderRadius: 2, padding: '12px 64px', textTransform: 'none' },
							},
						},
						MuiButtonBase: { defaultProps: { disableRipple: ! 0, LinkComponent: On } },
						MuiInputLabel: { styleOverrides: { root: { textTransform: 'uppercase', color: wn } } },
						MuiOutlinedInput: { styleOverrides: { notchedOutline: { borderColor: Bn } } },
						MuiMenuItem: { defaultProps: { LinkComponent: On } },
						MuiSlider: { styleOverrides: { rail: { backgroundColor: Bn } } },
					},
					palette: Pn,
					typography: {
						fontFamily: 'Source Sans Pro',
						h1: {
							fontFamily: 'Libre Baskerville',
							fontSize: '3.125rem',
							fontWeight: 400,
							lineHeight: 1.08,
						},
						h3: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.08 },
						subtitle1: { fontSize: '1.125rem', fontWeight: 500 },
						fontSize: 14,
					},
				},
				Ln = ( 0, Tn.Z )( Un ),
				qn = n( 7012 ),
				Rn = n( 2554 );
			var In,
				Mn = function () {
					var e = window._dsp_widget_styles
						.filter( function ( e ) {
							return e.innerHTML && ! e.innerHTML.includes( '@font-face' );
						} )
						.map( function ( e ) {
							return e.innerHTML;
						} )
						.join( '' );
					return e.length ? ( 0, U.jsx )( 'style', { children: e } ) : null;
				};
			var Fn,
				Wn = function ( e ) {
					var t = e.params,
						n = ( 0, h.I0 )(),
						i = ( 0, g.useRef )( null ),
						r = ( 0, g.useRef )( null );
					( 0, g.useEffect )( function () {
						n( xe( t ) ), n( he( t.urn ) );
					}, [] );
					var a,
						s = J(),
						o = s.data,
						c = s.error,
						d = s.isLoading,
						l =
							( s.refetch,
							( 0, Zn.default )( { key: 'css', prepend: ! 0, container: i.current } ) ),
						u = En.Z.div,
						p = g.useState( ! 1 ),
						m = ( 0, x.Z )( p, 2 ),
						A = m[ 0 ],
						v = m[ 1 ];
					return d
						? ( 0, U.jsx )( y.Z, {
								open: ! 0,
								children: ( 0, U.jsx )( E.Z, { children: ( 0, U.jsx )( _t, {} ) } ),
						  } )
						: o && ! o.exists
						? ( 0, U.jsx )( _.Z, { severity: 'error', children: 'User does not exist' } )
						: c
						? ( console.warn( 'token not valid', c ),
						  ( 0, U.jsxs )( _.Z, {
								severity: 'error',
								children: [
									( 0, U.jsx )( jt.Z, { children: 'Error' } ),
									null === c || void 0 === c || null === ( a = c.data ) || void 0 === a
										? void 0
										: a.errorMessage,
									'FETCH_ERROR' === ( null === c || void 0 === c ? void 0 : c.status ) &&
										'There was an error communicating with the server',
								],
						  } ) )
						: ( 0, U.jsx )( U.Fragment, {
								children:
									! A &&
									( 0, U.jsx )( _n.C, {
										value: l,
										children: ( 0, U.jsxs )( u, {
											id: 'wpcom-dsp-widget-shadow-dom',
											children: [
												( 0, U.jsx )( Mn, {} ),
												( 0, U.jsxs )( qn.Z, {
													theme: Ln,
													children: [
														( 0, U.jsx )( 'style', { ref: i } ),
														( 0, U.jsx )( Rn.Global, {
															styles: ( 0, Rn.css )(
																In ||
																	( In = ( 0, f.Z )( [
																		'\n                  :root {\n                    margin: 0;\n                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",\n                      "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;\n                    -webkit-font-smoothing: antialiased;\n                    -moz-osx-font-smoothing: grayscale;\n                  }\n\n                  code {\n                    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;\n                  }\n                ',
																	] ) )
															),
														} ),
														( 0, U.jsx )( 'div', { ref: r } ),
														( 0, U.jsx )( jn, {
															onClose: function () {
																v( ! 0 );
															},
															dialogContainer: function () {
																return r.current;
															},
														} ),
													],
												} ),
											],
										} ),
									} ),
						  } );
				},
				zn = n( 4942 ),
				Hn = ( 0, G.xC )( {
					reducer:
						( ( Fn = {} ),
						( 0, zn.Z )( Fn, V.reducerPath, V.reducer ),
						( 0, zn.Z )( Fn, 'adBuilder', pe.reducer ),
						Fn ),
					middleware: function ( e ) {
						return e().concat( V.middleware );
					},
				} );
			( 0, K.sj )( Hn.dispatch );
			var Gn = function ( e, t ) {
				var n = document.getElementById( e );
				m.render(
					( 0, U.jsx )( h.zt, { store: Hn, children: ( 0, U.jsx )( Wn, { params: t } ) } ),
					n
				);
			};
		},
		4398: function ( e, t, n ) {
			var i = n( 6657 ),
				r = n.n( i ),
				a = n( 2182 ),
				s = n.n( a )()( r() );
			s.push( [
				e.id,
				'.ad-container {\n  width: 300px;\n  height: 250px;\n  box-sizing: border-box;\n  align-content: start;\n  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;\n}\n\n.ad-container a {\n  text-decoration: none;\n  color: #000;\n}\n\n.ad-header {\n  background-color: #ffffff;\n  height: 44px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-left:16px;\n  padding-right:16px;\n  font-size: 0.9em;\n  box-sizing: border-box;\n}\n\n.ad-header-title {\n  font-weight: bold;\n  line-break: anywhere;\n}\n\n.ad-image {\n  box-sizing: border-box;\n  height: 146px;\n}\n.ad-image img {\n  width: 100%;\n  height: 100%;\n  -o-object-fit: cover;\n     object-fit: cover;\n}\n\n.ad-header-subtitle {\n  font-weight: 600;\n  color: #555;\n}\n\n.ad-snippet {\n  background-color: #ffffff;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-left:16px;\n  padding-right:16px;\n  font-weight: 500;\n  font-size: 1.1em;\n  flex: auto;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  line-clamp: 2;\n  box-sizing: border-box;\n  height: 60px;\n  white-space: pre-line;\n}\n\n.ad-snippet:nth-child(2) {\n  align-items: center;\n}\n\n.ad-snippet p {\n  max-lines: 2;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  line-clamp: 2;\n  max-height: 36px;\n  margin: 0;\n  line-height: 1em;\n}\n\n.no-image {\n  text-align: center;\n  padding-top: 40px;\n  font-size: 1.3em;\n}\n',
				'',
				{
					version: 3,
					sources: [ 'webpack://./../src/lib/creatives/adTemplates/ad_300_250_styles.css' ],
					names: [],
					mappings:
						'AAAA;EACE,YAAY;EACZ,aAAa;EACb,sBAAsB;EACtB,oBAAoB;EACpB,8IAA8I;AAChJ;;AAEA;EACE,qBAAqB;EACrB,WAAW;AACb;;AAEA;EACE,yBAAyB;EACzB,YAAY;EACZ,aAAa;EACb,8BAA8B;EAC9B,mBAAmB;EACnB,iBAAiB;EACjB,kBAAkB;EAClB,gBAAgB;EAChB,sBAAsB;AACxB;;AAEA;EACE,iBAAiB;EACjB,oBAAoB;AACtB;;AAEA;EACE,sBAAsB;EACtB,aAAa;AACf;AACA;EACE,WAAW;EACX,YAAY;EACZ,oBAAiB;KAAjB,iBAAiB;AACnB;;AAEA;EACE,gBAAgB;EAChB,WAAW;AACb;;AAEA;EACE,yBAAyB;EACzB,aAAa;EACb,8BAA8B;EAC9B,mBAAmB;EACnB,iBAAiB;EACjB,kBAAkB;EAClB,gBAAgB;EAChB,gBAAgB;EAChB,UAAU;EACV,gBAAgB;EAChB,uBAAuB;EACvB,aAAa;EACb,sBAAsB;EACtB,YAAY;EACZ,qBAAqB;AACvB;;AAEA;EACE,mBAAmB;AACrB;;AAEA;EACE,YAAY;EACZ,gBAAgB;EAChB,uBAAuB;EACvB,aAAa;EACb,gBAAgB;EAChB,SAAS;EACT,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;EAClB,iBAAiB;EACjB,gBAAgB;AAClB',
					sourcesContent: [
						'.ad-container {\n  width: 300px;\n  height: 250px;\n  box-sizing: border-box;\n  align-content: start;\n  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;\n}\n\n.ad-container a {\n  text-decoration: none;\n  color: #000;\n}\n\n.ad-header {\n  background-color: #ffffff;\n  height: 44px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-left:16px;\n  padding-right:16px;\n  font-size: 0.9em;\n  box-sizing: border-box;\n}\n\n.ad-header-title {\n  font-weight: bold;\n  line-break: anywhere;\n}\n\n.ad-image {\n  box-sizing: border-box;\n  height: 146px;\n}\n.ad-image img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.ad-header-subtitle {\n  font-weight: 600;\n  color: #555;\n}\n\n.ad-snippet {\n  background-color: #ffffff;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-left:16px;\n  padding-right:16px;\n  font-weight: 500;\n  font-size: 1.1em;\n  flex: auto;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  line-clamp: 2;\n  box-sizing: border-box;\n  height: 60px;\n  white-space: pre-line;\n}\n\n.ad-snippet:nth-child(2) {\n  align-items: center;\n}\n\n.ad-snippet p {\n  max-lines: 2;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  line-clamp: 2;\n  max-height: 36px;\n  margin: 0;\n  line-height: 1em;\n}\n\n.no-image {\n  text-align: center;\n  padding-top: 40px;\n  font-size: 1.3em;\n}\n',
					],
					sourceRoot: '',
				},
			] ),
				( s.locals = {} ),
				( t.Z = s );
		},
		7063: function ( e, t, n ) {
			var i = n( 6657 ),
				r = n.n( i ),
				a = n( 2182 ),
				s = n.n( a )()( r() );
			s.push( [
				e.id,
				"html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n  display: block;\n}\nbody {\n  line-height: 1;\n}\nol, ul {\n  list-style: none;\n}\nblockquote, q {\n  quotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n",
				'',
				{
					version: 3,
					sources: [ 'webpack://./../src/lib/creatives/adTemplates/reset.css' ],
					names: [],
					mappings:
						'AAAA;;;;;;;;;;;;;EAaE,SAAS;EACT,UAAU;EACV,SAAS;EACT,eAAe;EACf,aAAa;EACb,wBAAwB;AAC1B;AACA;;EAEE,cAAc;AAChB;AACA;EACE,cAAc;AAChB;AACA;EACE,gBAAgB;AAClB;AACA;EACE,YAAY;AACd;AACA;;EAEE,WAAW;EACX,aAAa;AACf;AACA;EACE,yBAAyB;EACzB,iBAAiB;AACnB',
					sourcesContent: [
						"html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n  display: block;\n}\nbody {\n  line-height: 1;\n}\nol, ul {\n  list-style: none;\n}\nblockquote, q {\n  quotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n",
					],
					sourceRoot: '',
				},
			] ),
				( s.locals = {} ),
				( t.Z = s );
		},
	},
] );
//# sourceMappingURL=178.bd55e7cb.chunk.js.map
