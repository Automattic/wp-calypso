/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';

class DnsTemplateSelector extends Component {
	handleOnSelect = ( option ) => {
		this.props.onTemplateClick( option.label );
	}

	render() {
		const { templates } = this.props;
		return (
			<SegmentedControl
				primary={ true }
				options={
					templates.map( ( template ) => {
						return {
							value: template.dnsTemplate,
							label: template.name
						};
					}, this )
				}
				initialSelected={ 'none' }
				onSelect={ this.handleOnSelect }
			/>
		);
	}
}

export default DnsTemplateSelector;
