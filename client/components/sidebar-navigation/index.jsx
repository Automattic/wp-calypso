/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import { getDocumentHeadTitle } from 'state/document-head/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import TranslatableString from 'components/translatable/proptype';

/**
 * Style dependencies
 */
import './style.scss';

function SidebarNavigation( { title, sectionTitle, children, toggleSidebar } ) {
	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div>
			<header className="current-section">
				<button onClick={ toggleSidebar }>
					<Gridicon icon="chevron-left" />
					{ children }
					<div>
						<h1 className="current-section__section-title">{ sectionTitle }</h1>
					</div>
				</button>
			</header>
			<h1 className="test-page-heading">{ title }</h1>
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
}

SidebarNavigation.propTypes = {
	title: TranslatableString,
	sectionTitle: TranslatableString,
	toggleSidebar: PropTypes.func.isRequired,
};

export default connect(
	state => ( {
		title: getDocumentHeadTitle( state ),
	} ),
	{
		toggleSidebar: () => setLayoutFocus( 'sidebar' ),
	}
)( SidebarNavigation );
