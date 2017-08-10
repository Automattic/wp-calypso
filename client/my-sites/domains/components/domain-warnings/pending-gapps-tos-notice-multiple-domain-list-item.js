/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

class PendingGappsTosNoticeMultipleDomainListItem extends React.PureComponent {
	onClickHandler = () => {
		this.props.onClick( this.props.domainName, this.props.user );
	};

	render() {
		return (
			<a
				href={ this.props.href }
				onClick={ this.onClickHandler }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ this.props.translate( 'Log in' ) }
			</a>
		);
	}
}

export default localize( PendingGappsTosNoticeMultipleDomainListItem );
