import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { border, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FirstPostTaskItem from './first-post-task-item';
import LaunchTaskItem from './launch-task-item';
import type { SelectedTask } from './select-tasks';

import './tailored-launchpad.scss';

type Props = {
	tasks: SelectedTask[];
};

export default function TailoredLaunchpad( { tasks }: Props ) {
	const translate = useTranslate();

	if ( tasks.length === 0 ) {
		return (
			<Text variant="muted">{ translate( "You're all set — nothing to set up right now." ) }</Text>
		);
	}

	return (
		<ItemGroup className="tailored-launchpad__group" isBordered={ false }>
			{ tasks.map( ( task ) => {
				const itemClassName =
					'tailored-launchpad__item' + ( task.completed ? ' is-completed' : '' );

				// Launch task triggers the same flow as the (removed) masterbar
				// button — dispatch + celebrate modal — instead of a plain link.
				if ( task.id === 'launch-site' && ! task.completed ) {
					return <LaunchTaskItem key={ task.id } task={ task } itemClassName={ itemClassName } />;
				}

				// "First creation" tasks land the user on a real wpcom draft
				// prefilled with Dolly's starter title + paragraphs (when
				// available) — no blank-page problem. Any of the three
				// content-creation tasks Dolly might pick gets the same
				// draft-on-click treatment.
				if (
					( task.id === 'publish-first-post' ||
						task.id === 'add-portfolio-piece' ||
						task.id === 'send-first-newsletter' ) &&
					! task.completed
				) {
					return (
						<FirstPostTaskItem key={ task.id } task={ task } itemClassName={ itemClassName } />
					);
				}

				const content = (
					<HStack alignment="center" spacing={ 3 }>
						<span className="tailored-launchpad__check" aria-hidden="true">
							<Icon icon={ border } size={ 24 } />
						</span>
						<VStack spacing={ 0 } className="tailored-launchpad__body">
							<span className="tailored-launchpad__title">{ task.title }</span>
							{ task.subtitle && (
								<Text variant="muted" size={ 12 }>
									{ task.subtitle }
								</Text>
							) }
						</VStack>
						<Spacer />
						{ ! task.completed && (
							<span className="tailored-launchpad__chevron" aria-hidden="true">
								<Icon icon={ chevronRight } size={ 20 } />
							</span>
						) }
					</HStack>
				);

				if ( task.completed ) {
					return (
						<Item
							key={ task.id }
							className={ itemClassName }
							aria-label={
								translate( '%(task)s — completed', {
									args: { task: task.title },
								} ) as string
							}
						>
							{ content }
						</Item>
					);
				}

				return (
					<Item
						key={ task.id }
						className={ itemClassName + ' tailored-launchpad__row' }
						as="a"
						href={ task.resolvedUrl }
						aria-label={ task.title }
					>
						{ content }
					</Item>
				);
			} ) }
		</ItemGroup>
	);
}
