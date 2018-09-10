/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import GridiconChevronLeft from 'gridicons/dist/chevron-left';

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
			<header className="current-section">
				<a onClick={ this.toggleSidebar } className={ this.props.linkClassName }>
					<GridiconChevronLeft />
					{ this.props.children }
					<div>
						<p className={ 'current-section__' + this.props.sectionName + '-title' }>
							{ this.props.sectionTitle }
						</p>
						<h1 className="current-section__section-title">{ this.props.title }</h1>
					</div>
				</a>
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
