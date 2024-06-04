import { SegmentedControl } from '@automattic/components';
import { translate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { navigate } from 'calypso/lib/navigate';

import './style.scss';

export function LogsHeader( { logType }: { logType: string } ) {
	const options = [
		{
			value: 'php',
			label: translate( 'PHP error' ),
		},
		{
			value: 'web',
			label: translate( 'Web server' ),
		},
	];

	const switchType = ( newType: string ) => {
		// check if pathname ends with either /php or /web, if so replace it with newType, otherwise append newType to the end of the pathname
		const newPath = window.location.pathname.endsWith( '/php' ) || window.location.pathname.endsWith( '/web' );
		const newUrl = newPath ? window.location.pathname.replace( /php|web$/, newType ) : `${ window.location.pathname }/${ newType }`;
		return navigate( newUrl );
	};

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
								onClick={ () => switchType( option.value ) }
							>
								{ option.label }
							</SegmentedControl.Item>
						);
					} ) }
				</SegmentedControl>
			</div>
		</div>
	);
}
