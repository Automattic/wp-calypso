import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import ButtonGroup from 'calypso/components/button-group';
import SelectDropdown from 'calypso/components/select-dropdown';
import { useHandleToggleMonitor } from './hooks';

import './style.scss';

interface Props {
	selectedSites: Array< { blog_id: number; url: string } >;
}

export default function DashboardBulkActions( { selectedSites }: Props ) {
	const translate = useTranslate();

	const isMobile = useMobileBreakpoint();

	const handleToggleActivateMonitor = useHandleToggleMonitor( selectedSites );

	const toggleMonitorActions = [
		{
			label: translate( 'Pause Monitor' ),
			action: () => handleToggleActivateMonitor( false ),
		},
		{
			label: translate( 'Resume Monitor' ),
			action: () => handleToggleActivateMonitor( true ),
		},
	];

	let content = null;

	if ( ! isMobile ) {
		content = (
			<ButtonGroup>
				{ toggleMonitorActions.map( ( { label, action } ) => (
					<Button key={ label } onClick={ action }>
						{ label }
					</Button>
				) ) }
			</ButtonGroup>
		);
	} else {
		content = (
			<SelectDropdown compact selectedText={ translate( 'Actions' ) }>
				{ toggleMonitorActions.map( ( { label, action } ) => (
					<SelectDropdown.Item key={ label } onClick={ action }>
						{ label }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
		);
	}

	return <div className="dashboard-bulk-actions">{ content }</div>;
}
