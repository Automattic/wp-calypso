/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import { requestStage } from 'state/stage/actions';
import ExternalLink from 'components/external-link';

class Stage extends Component {
	onClick = () => this.props.requestStage( this.props.siteId );

	render() {
		const { translate } = this.props;

		return 'undefined' !== typeof this.props.credentials ? (
			<CompactCard>
				<p className="site-tools__section-title">{ translate( 'Staging Site' ) }</p>
				<ExternalLink href={ 'https://' + this.props.credentials.host } target="_blank">
					{ 'https://' + this.props.credentials.host }
				</ExternalLink>
				<p className="site-tools__section-desc">
					{ this.props.credentials.type +
						' -P ' +
						this.props.credentials.port +
						' ' +
						this.props.credentials.user +
						'@' +
						this.props.credentials.host }
				</p>
			</CompactCard>
		) : (
			<CompactCard>
				<p className="site-tools__section-title">{ translate( 'Staging Site' ) }</p>
				<p className="site-tools__section-desc">
					{ translate( 'An instant clone of your site for testing.' ) }
				</p>
				<Button primary onClick={ this.onClick }>
					Create
				</Button>
			</CompactCard>
		);
	}
}

export default connect(
	null,
	{ requestStage }
)( localize( Stage ) );
