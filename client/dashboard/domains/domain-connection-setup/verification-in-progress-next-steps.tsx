import {
	Card,
	CardBody,
	Icon,
	PanelBody,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews, type Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { gridiconToWordPressIcon } from '../../utils/gridicons';

import './style.scss';

interface DomainConnectionNextStep {
	id: string;
	title: string;
	description: string;
	gridicon: string;
}

export default function VerificationInProgressNextSteps() {
	const data: DomainConnectionNextStep[] = [
		{
			id: 'automatic-verification',
			title: __( 'Automatic verification' ),
			description: __( 'We’ll check your DNS records and verify your domain connection.' ),
			gridicon: 'rotateRight',
		},
		{
			id: 'global-propagation',
			title: __( 'Global propagation' ),
			description: __(
				'Once name servers are verified, your domain name will gradually become live globally.'
			),
			gridicon: 'globe',
		},
		{
			id: 'cache-propagation',
			title: __( 'We’ll notify you when it’s ready' ),
			description: __( 'No need to refresh this page. We’ll email you as soon as it’s done.' ),
			gridicon: 'published',
		},
	];

	const fields: Field< DomainConnectionNextStep >[] = [
		{
			id: 'gridicon',
			render: ( { item } ) => (
				<Icon
					icon={ gridiconToWordPressIcon( item.gridicon ) }
					size={ 32 }
					className="dashboard-domain-connection-verification__icon"
				/>
			),
		},
		{
			id: 'title',
			getValue: ( { item } ) => item.title,
		},
		{
			id: 'description',
			getValue: ( { item } ) => item.description,
		},
	];

	const view = {
		fields: [ 'description' ],
		type: 'list' as const,
		titleField: 'title',
		mediaField: 'gridicon',
		showMedia: true,
		groupByField: 'type',
	};

	return (
		<Card className="verification-in-progress-next-steps">
			<CardBody>
				<PanelBody title={ __( 'What happens next' ) } initialOpen={ false }>
					<VStack spacing={ 4 }>
						<DataViews< DomainConnectionNextStep >
							data={ data }
							fields={ fields }
							view={ view }
							onChangeView={ () => {} }
							getItemId={ ( item ) => item.id }
							paginationInfo={ { totalItems: data.length, totalPages: 1 } }
							defaultLayouts={ { list: {} } }
						>
							<DataViews.Layout />
						</DataViews>
					</VStack>
				</PanelBody>
			</CardBody>
		</Card>
	);
}
