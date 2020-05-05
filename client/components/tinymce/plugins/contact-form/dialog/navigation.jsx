/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';

class ContactFormDialogNavigation extends React.Component {
	static displayName = 'ContactFormDialogNavigation';

	static propTypes = {
		fieldCount: PropTypes.number.isRequired,
		activeTab: PropTypes.oneOf( [ 'fields', 'settings' ] ).isRequired,
		onChangeTabs: PropTypes.func.isRequired,
	};

	render() {
		const tabs = [ 'fields', 'settings' ];

		return (
			<SectionNav selectedText="Form Fields">
				<SectionNavTabs>
					{ tabs.map( ( tab ) => (
						<SectionNavTabItem
							key={ 'contact-form-' + tab }
							selected={ this.props.activeTab === tab }
							count={ tab === 'fields' ? this.props.fieldCount : null }
							onClick={ () => this.props.onChangeTabs( tab ) }
						>
							{ tab === 'fields'
								? this.props.translate( 'Form Fields' )
								: this.props.translate( 'Settings' ) }
						</SectionNavTabItem>
					) ) }
				</SectionNavTabs>
			</SectionNav>
		);
	}
}

export default localize( ContactFormDialogNavigation );
