export interface Task {
	id: string;
	isCompleted: boolean;
	taskType: 'user' | 'blog';
}

export interface Checklist {
	designType: string;
	segment: number;
	tasks: Task[];
	verticals: string[];
}
