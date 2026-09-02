import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import NoteActions from './note-actions';
import { Avatar, Postscript, UserName, useParentCommentDetails } from './note-views';
import { BlockText, Timestamp, TitleText } from './rich-text';
import type { NoteView } from './note-model';

/**
 * The Slack shape: the new message leads, and the thread it answers sits
 * beneath it as an inset card — newest first, context second.
 */
export default function SlackThreadView( {
	view,
}: {
	view: Extract< NoteView, { kind: 'thread' } >;
} ) {
	const { parent, reply, note } = view;
	const parentDetails = useParentCommentDetails( note );

	return (
		<VStack spacing={ 3 }>
			<HStack spacing={ 3 } justify="flex-start" alignment="flex-start">
				<Avatar user={ reply.author } />
				<VStack spacing={ 1 } className="dashboard-notifications-inbox__column">
					<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
						{ reply.author && <UserName user={ reply.author } /> }
						<Timestamp timestamp={ view.timestamp } url={ view.url } />
					</HStack>
					{ reply.body && (
						<div className="dashboard-notifications-inbox__body">
							<Text className="dashboard-notifications-inbox__block-text">
								<BlockText block={ reply.body } />
							</Text>
						</div>
					) }
					<div className="dashboard-notifications-inbox__slack-parent-card">
						<VStack spacing={ 1 }>
							<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
								{ parent.avatarUrl && (
									<img
										className="dashboard-notifications-inbox__user-row-avatar"
										src={ parent.avatarUrl }
										alt=""
										width={ 24 }
										height={ 24 }
									/>
								) }
								<TitleText segments={ parent.author } />
								{ parentDetails?.date && (
									<Timestamp
										timestamp={ parentDetails.date }
										url={ parent.url ?? parentDetails.url }
									/>
								) }
							</HStack>
							<Text variant="muted">
								{ createInterpolateElement(
									/* translators: <post/> is the post the thread belongs to. */
									__( 'From a thread on <post />' ),
									{
										post: parent.postLink?.url ? (
											<a href={ parent.postLink.url } target="_blank" rel="noreferrer">
												{ parent.postLink.text }
											</a>
										) : (
											<span>{ parent.postLink?.text ?? '' }</span>
										),
									}
								) }
							</Text>
							<Text className="dashboard-notifications-inbox__body">
								{ parent.excerpt }
								{ parent.url && parent.isTruncated && (
									<>
										{ ' ' }
										<ExternalLink href={ parent.url }>{ __( 'Continue reading' ) }</ExternalLink>
									</>
								) }
							</Text>
						</VStack>
					</div>
					<NoteActions note={ note } />
				</VStack>
			</HStack>
			<Postscript blocks={ view.postscript } />
		</VStack>
	);
}
