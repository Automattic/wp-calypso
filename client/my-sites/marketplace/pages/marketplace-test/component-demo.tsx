import { CompactCard } from '@automattic/components';
import { TranslateResult } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import SimulatedProgressBar from 'calypso/my-sites/marketplace/components/simulated-progressbar';

export default function ComponentDemo(): JSX.Element {
	const steps: TranslateResult[] = [
		'Some Awesome Step 1',
		'Some Awesome Step 2',
		'Some Awesome Step 3',
		'Some Awesome Step 4',
	];
	return (
		<CompactCard>
			<CardHeading tagName="h1" size={ 21 }>
				A simulated progress bar for steps : { JSON.stringify( steps ) }
			</CardHeading>
			<hr />
			<SimulatedProgressBar steps={ steps } />
		</CompactCard>
	);
}
