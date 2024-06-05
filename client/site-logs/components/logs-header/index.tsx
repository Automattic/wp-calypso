import { SegmentedControl } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { setSiteLogType } from 'calypso/state/hosting/actions';
import { AppState, SiteLogType } from 'calypso/types';

import './style.scss';

interface Props {
	logType: SiteLogType;
	setSiteLogType: ( logType: SiteLogType ) => void;
}

export function LogsHeader( { logType, setSiteLogType }: Props ) {
	const options: { value: SiteLogType; label: string }[] = [
		{
			value: 'php',
			label: translate( 'PHP error' ),
		},
		{
			value: 'web',
			label: translate( 'Web server' ),
		},
	];

	console.log( setSiteLogType );

	return (
		<div className="logs-header">
			<NavigationHeader
				title={ translate( 'Logs' ) }
				subtitle={ translate(
					'View and download various server logs. {{link}}Learn more.{{/link}}',
					{
						components: {
							link: <InlineSupportLink supportContext="site-monitoring-logs" showIcon={ false } />,
						},
					}
				) }
			/>
			<div className="logs-header__selector-container">
				<div className="logs-header__selector-heading">{ translate( 'Log type' ) }</div>
				<SegmentedControl primary className="logs-header__selector-controls">
					{ options.map( ( option ) => {
						return (
							<SegmentedControl.Item
								key={ option.value }
								value={ option.value }
								selected={ option.value === logType }
								onClick={ () => setSiteLogType( option.value ) }
							>
								{ option.label }
							</SegmentedControl.Item>
						);
					}, setSiteLogType ) }
				</SegmentedControl>
			</div>
		</div>
	);
}

const mapStateToProps = ( state: AppState ) => {
	return {
		logType: state?.logType || 'php',
	};
};

export default connect( mapStateToProps, { setSiteLogType } )( LogsHeader );
