/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const HeaderCake = require( 'components/header-cake' );

const DomainManagementHeader = React.createClass( {
	render() {
		return (
			<HeaderCake className="domain-management-header" onClick={ this.props.onClick } backHref={ this.props.backHref }>
				<div className="domain-management-header__children">
					{ this.domainName() }
					<span className="domain-management-header__title">
						{ this.props.children }
					</span>
				</div>
			</HeaderCake>
		);
	},

	domainName() {
		if ( ! this.props.selectedDomainName ) {
			return null;
		}

		return <span>{ this.props.selectedDomainName }: </span>;
	}
} );

module.exports = DomainManagementHeader;
