import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import { preventWidows } from 'calypso/lib/formatting';
import AmplifyAddSite from '../../../add-site';
import AmplifyScoreCard from './score-card';

import './hero.scss';

export default function AmplifyHero() {
	return (
		<PageSectionColumns className="amplify-landing-hero">
			<PageSectionColumns.Column>
				<VStack className="amplify-landing-hero-text" spacing={ 6 } alignment="flex-start">
					<Heading level={ 1 } size={ 40 } lineHeight={ 1.1 }>
						{ __( 'Your clients want more business. Find out what their site is doing about it.' ) }
					</Heading>
					<Text size={ 18 } variant="muted">
						{ preventWidows(
							__(
								'Amplify by Automattic for Agencies scans your clients’ connected sites through two lenses: how their prospective clients perceive them on first visit, and how AI tools like ChatGPT and Perplexity read and rank them. Run a scan in minutes. Find what’s holding them back. Deliver fixes that prove your value and build trust.'
							)
						) }
					</Text>
					<AmplifyAddSite className="amplify-landing-cta" />
				</VStack>
			</PageSectionColumns.Column>
			<PageSectionColumns.Column alignCenter>
				<AmplifyScoreCard />
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
