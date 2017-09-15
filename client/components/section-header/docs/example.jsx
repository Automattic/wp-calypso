/**
* External dependencies
*/
import React from 'react';
import { localize } from 'i18n-calypso';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import SectionHeader from 'components/section-header';

var Cards = React.createClass( {
	displayName: 'SectionHeader',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
		    <div>
				<SectionHeader label={ this.props.translate( 'Team' ) } count={ 10 }>
					<Button compact primary>
						{ this.props.translate( 'Primary Action' ) }
					</Button>
					<Button compact>
						{ this.props.translate( 'Manage' ) }
					</Button>
					<Button
						compact
						onClick={ function() {
							alert( 'Clicked add button' );
						} }
					>
						{ this.props.translate( 'Add' ) }
					</Button>
				</SectionHeader>

				<h3>Clickable SectionHeader</h3>

				<SectionHeader label={ this.props.translate( 'Team' ) } count={ 10 } href="/devdocs/design/section-header">
				</SectionHeader>

				<h3>Empty SectionHeader</h3>
				<SectionHeader />
			</div>
		);
	}
} );

export default localize(Cards);
