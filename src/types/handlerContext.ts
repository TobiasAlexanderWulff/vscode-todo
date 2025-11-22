import { AutoDeleteCoordinator } from '../services/autoDeleteService';
import { TodoRepository } from '../todoRepository';
import { TodoWebviewHost } from '../todoWebviewHost';

export interface HandlerContext {
	repository: TodoRepository;
	webviewHost: TodoWebviewHost;
	autoDelete: AutoDeleteCoordinator<HandlerContext>;
}
