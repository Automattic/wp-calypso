import { ReactElement, ReactNode } from 'react';
import Card from '../card';

type Props = {
	title: string;
	children: ReactNode;
};

const SitePlanWarning = ( { title, children }: Props ): ReactElement => (
	<Card title={ title } icon="notice-outline">
		<p>{ children }</p>
	</Card>
);

export default SitePlanWarning;
