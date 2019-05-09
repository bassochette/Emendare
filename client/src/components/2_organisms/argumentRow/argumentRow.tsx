import React from 'react'
// Components
import { UserContext, Argument } from '../../../components'
// Interfaces
import { IArgument } from '../../../../../interfaces'
// Services
import { Socket } from '../../../services'

interface IEventRowProps {
  /** Following event */
  data: IArgument
  /** ID of the amend */
  amendID: string
  /** Index of the row */
  index: number
  measure: any
}

export const ArgumentRow = ({
  data,
  amendID,
  measure,
  index
}: IEventRowProps) => {
  const { user } = React.useContext(UserContext)

  const upVoteArgument = (argumentID: string, amendID: string) => {
    Socket.emit('upVoteArgument', { amendID, argumentID })
  }

  const unVoteArgument = (argumentID: string, amendID: string) => {
    Socket.emit('unVoteArgument', { amendID, argumentID })
  }

  return (
    <div style={{ marginTop: index !== 0 ? '1rem' : 0 }}>
      <Argument
        data={data}
        amendID={amendID}
        upVoteArgument={upVoteArgument}
        unVoteArgument={unVoteArgument}
        user={user}
      />
      <hr style={{ margin: 0 }} />
    </div>
  )
}
