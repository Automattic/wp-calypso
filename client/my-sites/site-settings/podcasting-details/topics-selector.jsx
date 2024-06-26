import { useTranslate } from 'i18n-calypso';
import FormSelect from 'calypso/components/forms/form-select';
import useTopics from './use-topics';

function TopicsSelector( props ) {
	const translate = useTranslate();
	const podcastingTopics = useTopics();

	return (
		<FormSelect { ...props }>
			<option value="0">{ translate( 'None', { context: 'podcast topic selector' } ) }</option>
			{ podcastingTopics.map( ( topic ) => {
				// The keys for podcasting in Apple Podcasts use &amp;
				const topicKey = topic.key.replace( '&', '&amp;' );

				return [
					<option key={ topicKey } value={ topicKey }>
						{ topic.label }
					</option>,
					...topic.subtopics.map( ( subtopic ) => {
						const subtopicKey = topicKey + ',' + subtopic.key.replace( '&', '&amp;' );
						return (
							<option key={ subtopicKey } value={ subtopicKey }>
								{ topic.label } » { subtopic.label }
							</option>
						);
					} ),
				];
			} ) }
		</FormSelect>
	);
}

export default TopicsSelector;
