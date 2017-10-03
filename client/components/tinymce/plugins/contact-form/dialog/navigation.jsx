/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';

export default React.createClass( {
	displayName: 'ContactFormDialogNavigation',

	propTypes: {
		fieldCount: PropTypes.number.isRequired,
		activeTab: PropTypes.oneOf( [ 'fields', 'settings' ] ).isRequired,
		onChangeTabs: PropTypes.func.isRequired
	},

	render() {
		const tabs = [ 'fields', 'settings' ];

		return (
			<SectionNav selectedText="Form Fields">
				<SectionNavTabs>
					{ tabs.map( tab => (
						<SectionNavTabItem
							key={ 'contact-form-' + tab }
							selected={ this.props.activeTab === tab }
							count={ tab === 'fields' ? this.props.fieldCount : null }
							onClick={ () => this.props.onChangeTabs( tab ) } >
							{ tab === 'fields' ? this.translate( 'Form Fields' ) : this.translate( 'Settings' ) }
						</SectionNavTabItem>
					) ) }
				</SectionNavTabs>
			</SectionNav>
		);
	}
} );
