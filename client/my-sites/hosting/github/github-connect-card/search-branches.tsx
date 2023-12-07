import { Spinner } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useEffect } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useGithubBranchesQuery } from './use-github-branches-query';

interface SearchBranchesProps {
	siteId: number | null;
	connectionId: number;
	onSelect( repo: string ): void;
	repoName?: string;
	selectedBranch?: string;
}

// If there are too many branches we're forcing the user to type its name because GH API
// has no search functionality for branches.
const SEARCH_BRANCHES_LIMIT = 30;

export const SearchBranches = ( {
	siteId,
	connectionId,
	onSelect,
	repoName,
	selectedBranch,
}: SearchBranchesProps ) => {
	const { __ } = useI18n();

	const { data: branches, isFetching } = useGithubBranchesQuery( siteId, repoName, connectionId );

	useEffect( () => {
		if (
			branches &&
			branches.length > 0 &&
			branches.length < SEARCH_BRANCHES_LIMIT &&
			( ! selectedBranch || ! branches.includes( selectedBranch ) )
		) {
			onSelect( branches[ 0 ] );
		}
	}, [ branches, onSelect, selectedBranch ] );

	if ( ! repoName || ! branches ) {
		return (
			<div style={ { position: 'relative' } }>
				<FormTextInput
					id="branch"
					disabled
					className="connect-branch__repository-field"
					placeholder={ __( 'Choose a branch' ) }
					value=""
				/>
				{ isFetching && <Spinner className="connect-branch__loading" /> }
			</div>
		);
	}

	if ( branches.length === 0 ) {
		return (
			<div style={ { position: 'relative' } }>
				<FormTextInput
					id="branch"
					disabled
					className="connect-branch__repository-field"
					placeholder={ __( 'No branches found' ) }
					value=""
				/>
				{ isFetching && <Spinner className="connect-branch__loading" /> }
			</div>
		);
	}

	if ( branches.length < SEARCH_BRANCHES_LIMIT ) {
		return (
			<FormSelect
				id="branch"
				className="connect-branch__field"
				placeholder={ __( 'Select a branch' ) }
				value={ selectedBranch }
				onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => onSelect( e.target.value ) }
			>
				{ branches.map( ( branch ) => (
					<option key={ branch } value={ branch }>
						{ branch }
					</option>
				) ) }
			</FormSelect>
		);
	}

	return (
		<div style={ { position: 'relative' } }>
			<FormTextInput
				id="branch"
				disabled={ isFetching }
				className="connect-branch__repository-field"
				placeholder={ __( 'Type a branch' ) }
				onChange={ ( e: ChangeEvent< HTMLInputElement > ) => onSelect( e.target.value ) }
				value={ selectedBranch }
			/>
			{ isFetching && <Spinner className="connect-branch__loading" /> }
		</div>
	);
};
