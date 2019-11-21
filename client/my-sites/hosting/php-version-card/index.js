/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import MaterialIcon from 'components/material-icon';
import Button from 'components/button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import Spinner from 'components/spinner';
import FormRadiosBar from 'components/forms/form-radios-bar';
import { errorNotice, successNotice } from 'state/notices/actions';

const requestId = ( siteId, method ) => `hosting-php-version-${ method }-${ siteId }`;

export const requestPhpVersion = siteId => {
	const method = 'GET';

	return requestHttpData(
		requestId( siteId, method ),
		http(
			{
				method,
				path: `/sites/${ siteId }/hosting/php-version`,
				apiNamespace: 'wpcom/v2',
				body: {},
			},
			{}
		),
		{
			fromApi: () => version => {
				return [ [ requestId( siteId, method ), version ] ];
			},
			freshness: 0,
		}
	);
};

export const setPhpVersion = ( siteId, version ) => {
	const method = 'POST';

	return requestHttpData(
		requestId( siteId, method ),
		http(
			{
				method,
				path: `/sites/${ siteId }/hosting/php-version`,
				apiNamespace: 'wpcom/v2',
				body: {
					version: version,
				},
			},
			{}
		),
		{
			fromApi: () => success => {
				if ( true === success ) {
					requestPhpVersion( siteId );
				}
				return [ [ requestId( siteId, method ), success ] ];
			},
			freshness: 0,
		}
	);
};

class PhpVersionCard extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			selectedPhpVersion: null,
		};
	}

	componentDidMount() {
		requestPhpVersion( this.props.siteId );
	}

	changePhpVersion = event => {
		const version = event.target.value;

		this.setState( {
			selectedPhpVersion: version,
		} );
	};

	componentDidUpdate( prevProps ) {
		const prevResponse = prevProps.updateResult;
		const { updateResult, translate } = this.props;

		const updateNoticeId = 'hosting-php-version';

		if ( prevResponse && prevResponse !== 'failure' && updateResult === 'failure' ) {
			this.props.errorNotice( translate( 'Failed to set PHP version.' ), {
				id: updateNoticeId,
			} );
		}

		if ( prevResponse && prevResponse !== 'success' && updateResult === 'success' ) {
			this.props.successNotice(
				translate( 'PHP version successfully set to %(version)s.', {
					args: {
						version: this.state.selectedPhpVersion,
					},
				} ),
				{
					id: updateNoticeId,
					showDismiss: false,
					duration: 5000,
				}
			);
		}
	}

	getPhpVersions() {
		return [
			{
				label: '7.2',
				value: '7.2',
			},
			{
				label: '7.3',
				value: '7.3',
			},
			{
				label: '7.4',
				value: '7.4',
			},
		];
	}

	getContent() {
		if ( this.props.loading ) {
			return;
		}

		const { translate, siteId, updating, version } = this.props;
		const { selectedPhpVersion } = this.state;

		return (
			<div>
				<p>
					{ translate(
						'Your site is currently running PHP version {{strong}}%(version)s.{{/strong}}',
						{
							args: {
								version,
							},
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>

				<div className="php-version-card__radio">
					<FormRadiosBar
						checked={ selectedPhpVersion || version }
						onChange={ this.changePhpVersion }
						items={ this.getPhpVersions() }
					/>
				</div>
				<Button onClick={ () => setPhpVersion( siteId, selectedPhpVersion ) } busy={ updating }>
					<span>{ translate( 'Update PHP Version' ) }</span>
				</Button>
			</div>
		);
	}

	render() {
		const { translate, loading } = this.props;

		return (
			<Card className="php-version-card">
				<div className="php-version-card__icon">
					<MaterialIcon icon="dns" size={ 32 } />
				</div>
				<div className="php-version-card__body">
					<CardHeading>{ translate( 'PHP Version' ) }</CardHeading>
					{ this.getContent() }
				</div>
				{ loading && <Spinner /> }
			</Card>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		const phpVersionGet = getHttpData( requestId( siteId, 'GET' ) );
		const phpVersionUpdate = getHttpData( requestId( siteId, 'POST' ) );
		const version = get( phpVersionGet, 'data', null );

		return {
			version,
			loading: ! version && phpVersionGet.state === 'pending',
			updating: phpVersionUpdate.state === 'pending',
			updateResult: phpVersionUpdate.state,
			siteId,
		};
	},
	{ errorNotice, successNotice }
)( localize( PhpVersionCard ) );
