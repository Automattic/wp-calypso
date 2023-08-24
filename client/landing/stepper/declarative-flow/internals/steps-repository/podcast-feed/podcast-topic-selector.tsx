import { useI18n } from '@wordpress/react-i18n';
import { map } from 'lodash';
import { FormEvent } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import podcastingTopics from 'calypso/my-sites/site-settings/podcasting-details/topics';

interface Props {
	fields: Array< string >;
	handleSelect: ( event: FormEvent< Element > ) => void;
	category: string;
}

const PodcastTopicSelector = ( { fields, handleSelect, category }: Props ) => {
	const { __ } = useI18n();
	return (
		<FormSelect
			id={ category }
			name={ category }
			onChange={ handleSelect }
			value={ fields[ category ] || 0 }
		>
			<option value="0">{ __( 'None' ) }</option>
			{ map( Object.entries( podcastingTopics ), ( [ topic, subtopics ] ) => {
				// The keys for podcasting in Apple Podcasts use &amp;
				const topicKey = topic.replace( '&', '&amp;' );
				return [
					<option key={ topicKey } value={ topicKey }>
						{ topic }
					</option>,
					...map( subtopics, ( subtopic ) => {
						const subtopicKey = topicKey + ',' + subtopic.replace( '&', '&amp;' );
						return (
							<option key={ subtopicKey } value={ subtopicKey }>
								{ topic } » { subtopic }
							</option>
						);
					} ),
				];
			} ) }
		</FormSelect>
	);
};

export default PodcastTopicSelector;
