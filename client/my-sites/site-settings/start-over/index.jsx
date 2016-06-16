/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var HeaderCake = require( 'components/header-cake' ),
	ActionPanel = require( 'my-sites/site-settings/action-panel' ),
	ActionPanelTitle = require( 'my-sites/site-settings/action-panel/title' ),
	ActionPanelBody = require( 'my-sites/site-settings/action-panel/body' ),
	ActionPanelFigure = require( 'my-sites/site-settings/action-panel/figure' ),
	ActionPanelFooter = require( 'my-sites/site-settings/action-panel/footer' ),
	Button = require ( 'components/button' ),
	Gridicon = require ( 'components/gridicon' ),
	support = require('lib/url/support');

module.exports = React.createClass( {

	displayName: 'StartOver',

	getInitialState: function() {
		return {
			site: this.props.sites.getSelectedSite()
		};
	},

	componentWillMount: function() {
		debug( 'Mounting StartOverPage React component.' );
		this.props.sites.on( 'change', this._updateSite );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this._updateSite );
	},

	render: function() {
		var strings = {
			startOver: this.translate( 'Start Over' ),
			contactSupport: this.translate( 'Contact Support' )
		};

		return (
			<div className="main main-column" role="main">
				<HeaderCake onClick={ this._goBack }><h1>{ strings.startOver }</h1></HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure inlineBodyText={ true }>
							<svg width="170" height="143" viewBox="0 0 170 143" xmlns="http://www.w3.org/2000/svg"><title>{ strings.startOver }</title><g fill="none" fillRule="evenodd"><path d="M140.857 65.44c0 31.18-25.424 56.554-56.667 56.554-31.242 0-56.666-25.373-56.666-56.553 0-31.18 25.424-56.553 56.666-56.553 31.243 0 56.667 25.373 56.667 56.554zM61.93 111.2L37.642 44.74c-2.846 6.312-4.426 13.318-4.426 20.703 0 20.136 11.762 37.49 28.712 45.76zm52.745-31.873c2.212-7.07 3.92-12.12 3.92-16.475 0-6.25-2.277-10.604-4.236-14.012-2.53-4.165-5-7.7-5-11.928 0-4.67 3.543-9.027 8.54-9.027l.696.063c-9.045-8.268-21.124-13.38-34.406-13.38-17.77 0-33.455 9.15-42.563 22.91l3.29.064c5.31 0 13.534-.63 13.534-.63 2.784-.127 3.1 3.85.38 4.228 0 0-2.783.315-5.882.442L71.54 96.684l11.134-33.39-7.908-21.712c-2.78-.127-5.374-.442-5.374-.442-2.72-.19-2.404-4.355.316-4.228 0 0 8.41.63 13.408.63 5.375 0 13.598-.63 13.598-.63 2.718-.127 3.097 3.85.316 4.228 0 0-2.72.315-5.82.442l18.404 54.66 5.06-16.915zm-13.598 34.084c-.126-.253-.253-.442-.316-.695L85.076 69.858 69.77 114.23a52.04 52.04 0 0 0 14.42 2.02c5.946 0 11.637-1.01 16.887-2.84zm28.144-67.156c0 5.174-.95 10.982-3.857 18.24l-15.56 44.876c15.116-8.773 25.298-25.184 25.298-43.93 0-8.837-2.21-17.168-6.195-24.426.19 1.642.316 3.408.316 5.24z" fill="#A8BECE"/><path d="M84.595 143c33.755 0 61.12-2.713 61.12-6.06 0-3.346-27.365-6.06-61.12-6.06-33.755 0-61.12 2.714-61.12 6.06 0 3.347 27.365 6.06 61.12 6.06z" fill-opacity=".37" fill="#D5E5EB"/><g fill="#D5E5EB"><path d="M10.365 23.08c-.295-.844-1.212-1.765-2.06-2.062L.78 18.38c-.842-.294-.847-.773.002-1.072l7.528-2.65c.844-.3 1.767-1.218 2.066-2.067l2.65-7.527c.3-.844.777-.85 1.074 0l2.637 7.522c.295.843 1.213 1.764 2.06 2.06l7.524 2.638c.844.295.85.773 0 1.073l-7.528 2.65c-.844.298-1.766 1.217-2.066 2.067l-2.65 7.527c-.298.844-.777.85-1.074.002l-2.637-7.523zM157.512 65.034c-.147-.42-.605-.88-1.028-1.028l-2.285-.8c-.42-.148-.424-.387 0-.536l2.286-.805c.42-.148.88-.607 1.03-1.03l.806-2.286c.148-.422.386-.425.535-.002l.8 2.285c.148.42.605.88 1.03 1.028l2.283.8c.42.15.423.387 0 .537l-2.287.805c-.42.148-.88.606-1.03 1.03l-.805 2.286c-.148.42-.387.424-.535 0l-.8-2.284zM151.85 7.518l-2.02.972.97-2.024-.97-2.024 2.02.97 2.02-.97-.97 2.024.97 2.024-2.02-.972zM167.403 37.007l-2.02.97.97-2.023-.97-2.023 2.02.972 2.02-.97-.97 2.022.97 2.024-2.02-.97zM121.908 6.98c-.405-.195-1.053-.2-1.467 0l-2.975 1.43c-.406.196-.58.034-.382-.38l1.428-2.983c.196-.406.2-1.055 0-1.47L117.084.595c-.195-.406-.033-.582.382-.382l2.976 1.43c.406.196 1.054.2 1.468 0l2.976-1.43c.405-.195.58-.033.382.382l-1.43 2.982c-.193.406-.198 1.055 0 1.47l1.43 2.982c.194.405.032.58-.382.38l-2.976-1.43zM41.684 11.154c-.405-.195-1.053-.2-1.467 0l-2.976 1.43c-.404.196-.58.034-.38-.38l1.428-2.983c.194-.405.2-1.055 0-1.47l-1.43-2.982c-.193-.406-.03-.58.383-.382l2.977 1.43c.405.196 1.053.2 1.467 0l2.976-1.43c.406-.195.58-.033.382.382l-1.43 2.982c-.193.406-.197 1.056 0 1.47l1.43 2.983c.194.406.033.58-.382.382l-2.976-1.43zM152.8 30.062c-.146-.42-.604-.88-1.027-1.028l-2.285-.8c-.42-.148-.423-.387 0-.536l2.287-.805c.42-.148.88-.607 1.03-1.03l.806-2.286c.15-.42.387-.424.536 0l.8 2.284c.148.42.605.88 1.03 1.03l2.283.8c.42.147.422.385 0 .535l-2.288.805c-.42.148-.88.606-1.03 1.03l-.805 2.286c-.148.42-.387.424-.535 0l-.8-2.284zM7.708 55.51c-.148-.42-.605-.878-1.03-1.027l-2.283-.8c-.42-.148-.423-.386 0-.536l2.287-.805c.42-.148.88-.606 1.03-1.03l.805-2.286c.148-.42.387-.424.535 0l.8 2.284c.148.42.606.88 1.03 1.028l2.284.8c.42.148.423.386 0 .536l-2.287.805c-.422.147-.882.605-1.03 1.03l-.807 2.285c-.148.42-.386.424-.535 0l-.8-2.284z"/></g></g></svg>
						</ActionPanelFigure>
						<ActionPanelTitle>{ strings.startOver }</ActionPanelTitle>
						<p>{
							this.translate( 'If you want a site but don\'t want any of the posts and pages you have now, our support ' +
								'team can delete your posts, pages, media, and comments for you.' )
						}</p>
						<p>{
							this.translate( 'This will keep your site and URL active, but give you a fresh start on your content ' +
								'creation. Just contact us to have your current content cleared out.' )
						}</p>
						<p>{
							this.translate( 'Alternatively, you can delete all content from your site by following {{link}}the steps here{{/link}}.',
							{
								components: {
									link: <a href={ support.EMPTY_SITE } target="_blank" />
								}
							}
						)
						}</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<Button
							className="settings-action-panel__support-button"
							href="/help/contact">
							{ strings.contactSupport }
						</Button>
					</ActionPanelFooter>
				</ActionPanel>
			</div>
		);
	},

	_updateSite: function() {
		this.setState( {
			site: this.props.sites.getSelectedSite()
		} );
	},

	_goBack: function() {
		var site = this.state.site;
		page( '/settings/general/' + site.slug );
	}

} );
