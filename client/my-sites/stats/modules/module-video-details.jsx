/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:module-video-details' );

/**
 * Internal dependencies
 */
var StatsList = require( '../stats-list' ),
	skeleton = require( '../mixin-skeleton' ),
	Card = require( 'components/card' );


module.exports = React.createClass( {
	displayName: 'StatModuleVideoDetails',

	mixins: [ skeleton( 'data' ) ],

	data: function( nextProps ) {
		var props = nextProps || this.props;

		return props.summaryList.data;
	},

	render: function() {
		debug( 'Rendering video details' );

		var classes;

		classes = [
			'stats-module',
			'is-expanded',
			'summary',
			'is-video-details',
			{
				'is-loading': this.props.summaryList.isLoading(),
				'is-showing-info': this.state.showInfo,
				'has-no-data': this.props.summaryList.isEmpty()
			}
		];

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div className="videoplays">
					<div className="module-header">
						<h4 className="module-header-title">{ this.translate( 'Video Embeds' ) }</h4>
					</div>
					<div className="module-content">
						<div className="stats-async-metabox-wrapper">
							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-label">{ this.translate( 'Page' ) }</span>
									</span>
								</li>
							</ul>
							<div className="module-placeholder is-void"></div>
							<StatsList moduleName='Video Details' data={ this.props.summaryList.response.pages ? this.props.summaryList.response.pages : [] } />
						</div>
					</div>
				</div>
			</Card>
		);
	}
} );
