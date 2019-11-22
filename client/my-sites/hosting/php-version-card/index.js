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
import FormSelect from 'components/forms/form-select';
import FormLabel from 'components/forms/form-label';
import { errorNotice, successNotice } from 'state/notices/actions';

/**
 * Style dependencies
 */
import './style.scss';

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

	getPhpVersions = () => {
		return [
			{
				label: '7.2',
				value: '7.2',
			},
			{
				label: '7.3 (recommended)',
				value: '7.3',
			},
		];
	};

	getContent() {
		if ( this.props.loading ) {
			return;
		}

		const { translate, siteId, updating, version } = this.props;
		const { selectedPhpVersion } = this.state;

		const isButtonDisabled = ! selectedPhpVersion || selectedPhpVersion === version;
		let buttonTooltip = undefined;
		if ( isButtonDisabled ) {
			buttonTooltip = translate( "You're already running PHP %(version)s.", {
				args: {
					version,
				},
			} );
		}

		return (
			<div>
				<div>
					<FormLabel>{ translate( 'Your site is currently running:' ) }</FormLabel>
					<FormSelect
						className="php-version-card__version-select"
						onChange={ this.changePhpVersion }
						defaultValue={ version }
					>
						{ this.getPhpVersions().map( option => {
							return (
								<option
									disabled={ option.value === version }
									value={ option.value }
									key={ option.label }
								>
									{ option.label }
								</option>
							);
						} ) }
					</FormSelect>
				</div>
				<Button
					className="php-version-card__set-version"
					onClick={ () => setPhpVersion( siteId, selectedPhpVersion ) }
					busy={ updating }
					disabled={ isButtonDisabled }
					title={ buttonTooltip }
				>
					<span>{ translate( 'Update PHP Version' ) }</span>
				</Button>
			</div>
		);
	}

	render() {
		const { translate, loading } = this.props;

		return (
			<Card className="php-version-card">
				<MaterialIcon icon="dns" size={ 32 } />
				<CardHeading>{ translate( 'PHP Version' ) }</CardHeading>
				{ this.getContent() }
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
