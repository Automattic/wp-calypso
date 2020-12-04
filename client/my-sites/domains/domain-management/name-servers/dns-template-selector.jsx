/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';

class DnsTemplateSelector extends React.PureComponent {
	handleOnSelect = ( option ) => {
		this.props.onTemplateClick( option.label );
	};

	render() {
		const { templates } = this.props;

		return (
			<SimplifiedSegmentedControl
				primary
				options={ templates.map( ( template ) => {
					return {
						value: template.dnsTemplateService,
						label: template.name,
					};
				} ) }
				initialSelected={ 'none' }
				onSelect={ this.handleOnSelect }
			/>
		);
	}
}

export default DnsTemplateSelector;
