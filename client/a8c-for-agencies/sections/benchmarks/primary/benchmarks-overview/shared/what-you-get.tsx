import { __ } from '@wordpress/i18n';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';

const getBenefits = (): { title: string; description: string }[] => [
	{
		title: __( 'See where you really stand' ),
		description: __(
			'Get your numbers benchmarked against two peer groups: agencies using Automattic for Agencies and agencies who aren’t. Most reports only show you one side.'
		),
	},
	{
		title: __( 'Find the gaps that matter' ),
		description: __(
			'We flag the metrics where you’re behind your peers and link you to specific playbooks, templates, and case studies that help you close them.'
		),
	},
	{
		title: __( 'Know your AI maturity' ),
		description: __(
			'A 0 to 100 score and tier so you can see how your AI adoption compares to your peer set, plus what to focus on next.'
		),
	},
	{
		title: __( 'Stay anonymous' ),
		description: __(
			'Your data is aggregated. Your name and details are never shown to other participants.'
		),
	},
];

export default function WhatYouGet() {
	return (
		<StepSection heading={ __( 'What do I get out of it?' ) }>
			<div className="benchmarks-what-youll-get">
				{ getBenefits().map( ( benefit ) => (
					<StepSectionItem
						key={ benefit.title }
						heading={ benefit.title }
						description={ benefit.description }
					/>
				) ) }
			</div>
		</StepSection>
	);
}
