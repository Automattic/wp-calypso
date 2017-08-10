/**
 * External Dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	SiteIcon = require( 'blocks/site-icon' );

module.exports = {
	Page: localize(class extends React.Component {
	    static displayName = 'PagePlaceholder';

		render() {
			return (
			    <CompactCard className="page is-placeholder">
					{ this.props.multisite ? <SiteIcon size={ 34 } /> : null }
					<a className="page__title"><span className="placeholder-text">{ this.props.translate( 'Loading a page of Pages…' ) }</span></a>
					{ this.props.multisite ? <span className="page__site-url "><span className="placeholder-text">{ this.props.translate( 'A domain, quite soon…') }</span></span> : null }
				</CompactCard>
			);
		}
	}),
	Marker: class extends React.Component {
	    static displayName = 'MarkerPlaceholder';

		render() {
			return (
				<div className="pages__page-list-header is-placeholder">
					<span>&nbsp;</span>
				</div>
			);
		}
	}
};
