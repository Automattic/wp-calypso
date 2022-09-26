import Card from '../card';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren< {
	title: string;
} >;

const SitePlanWarning = ( { title, children }: Props ) => (
	<Card title={ title } icon="notice-outline">
		<p>{ children }</p>
	</Card>
);

export default SitePlanWarning;
