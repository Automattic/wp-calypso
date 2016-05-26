/**
* External dependencies
*/
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import SectionHeader from 'components/section-header';
import Button from 'components/button';

var Cards = React.createClass( {
	displayName: 'SectionHeader',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Section Header"
				url="/devdocs/design/section-header"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<SectionHeader label={ this.translate( 'Team' ) } count={ 10 }>
					<Button compact primary>
						{ this.translate( 'Primary Action' ) }
					</Button>
					<Button compact>
						{ this.translate( 'Manage' ) }
					</Button>
					<Button
						compact
						onClick={ function() {
							alert( 'Clicked add button' );
						} }
					>
						{ this.translate( 'Add' ) }
					</Button>
				</SectionHeader>

				<h2>Clickable SectionHeader</h2>

				<SectionHeader label={ this.translate( 'Team' ) } count={ 10 } href="/devdocs/design/section-header">
				</SectionHeader>
			</DocsExample>
		);
	}
} );

module.exports = Cards;
