/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import { getDocumentHeadTitle } from 'state/document-head/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

class SidebarNavigation extends React.Component {
	constructor( props ) {
		super( props );
		this.toggleSidebar = this.toggleSidebar.bind( this );
	}

	toggleSidebar( event ) {
		event.preventDefault();

		if ( this.props.backToSites ) {
			this.props.setLayoutFocus( 'sites' );
			return; 
		}

		this.props.setLayoutFocus( 'sidebar' );
	}

	render() {
		return (
			<header className="current-section">
				<a onClick={ this.toggleSidebar } className={ this.props.linkClassName }>
					<Gridicon icon="chevron-left" />
					{ this.props.children }
					<div>
						<p className={ 'current-section__' + this.props.sectionName + '-title' }>{ this.props.sectionTitle }</p>
						<h1 className="current-section__section-title">{ this.props.title }</h1>
					</div>
				</a>
			</header>
		);
	}
}

SidebarNavigation.propTypes = {
	backToSites: PropTypes.bool,
	title: PropTypes.string,
	linkClassName: PropTypes.string,
	sectionTitle: PropTypes.string,
	sectionName: PropTypes.string.isRequired,
	setLayoutFocus: PropTypes.func.isRequired,
};

export default connect(
	state => ( {
		title: getDocumentHeadTitle( state )
	} ),
	{ setLayoutFocus }
)( SidebarNavigation );
