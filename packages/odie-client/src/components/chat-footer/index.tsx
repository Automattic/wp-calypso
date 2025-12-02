import { Notice, animations, ChatInput, AgentUIProvider } from '@automattic/agenttic-ui';
import { motion } from 'framer-motion';
import './style.scss';
import type { Transition } from 'framer-motion';
import type { ComponentProps } from 'react';

type AgentUIFooterProps = ComponentProps< typeof ChatInput > & {
	attachmentPreviews?: React.ReactNode;
	setInputValue?: ( value: string ) => void;
	notice?: ComponentProps< typeof Notice >;
};

export function AgentUIFooter( props: AgentUIFooterProps ) {
	return (
		<AgentUIProvider value={ {} as any }>
			<motion.div
				data-slot="chat-footer"
				className="agenttic--chat-footer-container"
				initial={ { opacity: 0, scale: 1 } }
				animate={ { opacity: 1, scale: 1 } }
				transition={ { ...animations.fastSpring } as Transition }
			>
				{ props.attachmentPreviews }
				{ props.notice ? <Notice { ...props.notice } /> : null }
				<ChatInput { ...props } />
			</motion.div>
		</AgentUIProvider>
	);
}
