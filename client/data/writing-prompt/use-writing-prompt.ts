import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestWritingPrompt } from 'calypso/state/writing-prompts/actions';
import getWritingPrompt from 'calypso/state/writing-prompts/selectors';
import { WritingPrompt } from 'calypso/state/writing-prompts/types';

const useWritingPrompt = ( siteId: string ): WritingPrompt | null => {
	const dispatch = useDispatch();
	const { writingPrompt } = useSelector( ( state ) => ( {
		writingPrompt: getWritingPrompt( state, Number( siteId ) ),
	} ) );

	useEffect( () => {
		if ( siteId && ! writingPrompt ) {
			dispatch( requestWritingPrompt( siteId ) );
		}
	}, [ dispatch, siteId, writingPrompt ] );

	return writingPrompt;
};

export default useWritingPrompt;
