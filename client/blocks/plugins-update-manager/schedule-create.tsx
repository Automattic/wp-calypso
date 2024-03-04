import {
	__experimentalText as Text,
	Button,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { SiteSlug } from 'calypso/types';
import { ScheduleForm } from './schedule-form';

interface Props {
	siteSlug: SiteSlug;
	onNavBack?: () => void;
}
export const ScheduleCreate = ( props: Props ) => {
	const { siteSlug, onNavBack } = props;

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							Back
						</Button>
					) }
				</div>
				<Text>New Schedule</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody>
				<ScheduleForm siteSlug={ siteSlug } />
			</CardBody>
			<CardFooter>
				<Button form="schedule" type="submit" variant="primary">
					Create
				</Button>
			</CardFooter>
		</Card>
	);
};
