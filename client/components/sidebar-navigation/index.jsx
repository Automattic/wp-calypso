/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import { getDocumentHeadTitle } from 'state/document-head/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import TranslatableString from 'components/translatable/proptype';

class SidebarNavigation extends React.Component {
	constructor( props ) {
		super( props );
		this.toggleSidebar = this.toggleSidebar.bind( this );
	}

	toggleSidebar( event ) {
		event.preventDefault();
		this.props.setLayoutFocus( 'sidebar' );
	}

	render() {
		return (
			<header className="sidebar-navigation">
				<button onClick={ this.toggleSidebar } className={ this.props.linkClassName }>
					<Gridicon icon="arrow-left" />
					<div>
						<h1 className="sidebar-navigation__section-title">{ this.props.title }</h1>
						<p className={ 'sidebar-navigation__' + this.props.sectionName + '-title' }>
							{ this.props.sectionTitle }
						</p>
					</div>
				</button>
			</header>
		);
	}
}

SidebarNavigation.propTypes = {
	title: TranslatableString,
	linkClassName: PropTypes.string,
	sectionTitle: TranslatableString,
	sectionName: PropTypes.string.isRequired,
	setLayoutFocus: PropTypes.func.isRequired,
};

export default connect(
	state => ( {
		title: getDocumentHeadTitle( state ),
	} ),
	{ setLayoutFocus }
)( SidebarNavigation );
