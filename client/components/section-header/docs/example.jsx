/** @format */
/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' );

class Cards extends React.PureComponent {
	static displayName = 'SectionHeader';

	render() {
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

				<SectionHeader
					label={ this.props.translate( 'Team' ) }
					count={ 10 }
					href="/devdocs/design/section-header"
				/>

				<h3>Empty SectionHeader</h3>
				<SectionHeader />
			</div>
		);
	}
}

module.exports = localize( Cards );
