import React, { useContext } from 'react'
// Components
import {
  TextEventCard,
  AmendEventCard,
  ResultEventCard,
  UserContext,
  withEventCard,
  ModalContainer,
  ArgumentModal,
  Button,
  Icon
} from '../../../components'
// Interfaces
import { INews } from '../../../../../interfaces'

interface IEventRowProps {
  /** Following event */
  data: INews
  /** Tell if the event is new */
  isNew: boolean
  /** Index of the row */
  index: number
  measure: any
}

const displayRightEvent = (type: string): React.ComponentType<any> => {
  switch (type) {
    case 'text':
      return TextEventCard
    case 'amend':
      return AmendEventCard
    case 'result':
      return ResultEventCard
    default:
      return () => null
  }
}

export const EventRow = ({ data, measure, isNew, index }: IEventRowProps) => {
  const { user } = useContext(UserContext)
  return (
    <React.Fragment>
      <div
        style={{
          backgroundColor: isNew ? 'rgba(255, 221, 87, 0.1)' : 'initial',
          padding: '1rem'
        }}
      >
        {data.target &&
          data.target.data &&
          withEventCard(measure, index, data.target.data, user)(
            displayRightEvent(data.event.target.type)
          )}
      </div>
      <ModalContainer>
        {data.event.target.type === 'amend' && (
          <ModalContainer.Modal.Trigger>
            <Button
              style={{
                borderRadius: 0,
                border: 'none',
                backgroundColor: 'hsl(0, 0%, 96%)'
              }}
              className="is-fullwidth is-outlined"
            >
              <Icon name="fa-comments" />
              <span>Arguments</span>
            </Button>
          </ModalContainer.Modal.Trigger>
        )}
        {data.target &&
          data.target.data &&
          data.event.target.type === 'amend' && (
            <ArgumentModal amend={data.target.data} user={user} />
          )}
      </ModalContainer>
      <hr style={{ margin: 0, backgroundColor: '#e8e8e8' }} />
    </React.Fragment>
  )
}
