/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
/**
 * Internal dependencies
 */
import FormattedBlock from 'components/notes-formatted-block';
import { useApplySiteOffset } from 'landing/jetpack-cloud/components/site-offset';
import { useLocalizedMoment } from 'components/localized-moment';

// FUTURE WORK: move this to a shared location
interface Activity {
	activityDescription: [
		{
			children?: [ { text: string } ];
			intent?: string;
			section?: string;
			type?: string;
			url?: string;
		}
	];
	activityName: string;
}

interface Props {
	activity: Activity;
}

const ActivityDescription: FunctionComponent< Props > = ( {
	activity: { activityName, activityDescription },
} ) => {
	const applySiteOffset = useApplySiteOffset();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	return (
		<>
			{ activityDescription.map( ( description, index ) => {
				const { children, intent, section, type, url } = description;

				let content = description;

				if ( type === 'link' && url?.startsWith( 'https://wordpress.com/' ) ) {
					content = { ...description, type: undefined, url: undefined };
				} else if (
					activityName === 'rewind__complete' &&
					!! children &&
					children.length >= 1 &&
					!! children[ 0 ].text
				) {
					const matches = [
						...children[ 0 ].text.matchAll(
							/^Restored to ([1-3][0-9]?:[1-5]?[0-9] [p|a]m) on ([a-zA-Z]+ [1-3]?[0-9])$/g
						),
					];

					const timeString = matches.map( ( match ) => match[ 1 ] )[ 0 ];
					const dateString = matches.map( ( match ) => match[ 2 ] )[ 0 ];
					const yearString = moment().format( 'YYYY' );

					const siteRestoreTime =
						applySiteOffset && timeString && dateString
							? applySiteOffset(
									moment( `${ timeString } ${ dateString }  ${ yearString }`, 'h:m a MMMM D YYYY' )
							  ).format( 'LLL' )
							: '';

					content = {
						...description,
						children: [
							{
								text: siteRestoreTime
									? translate( 'Restored to %(dateTime)s', {
											args: {
												dateTime: siteRestoreTime,
											},
									  } ).toString()
									: '',
							},
						],
					};
				}

				return (
					<FormattedBlock
						content={ content }
						key={ index }
						meta={ { activity: activityName, intent, section } }
					/>
				);
			} ) }
		</>
	);
};

export default ActivityDescription;
