import { Application } from 'stimulus'

import { DialogController } from './controllers'

const application = Application.start()
application.register('dialog', DialogController)
