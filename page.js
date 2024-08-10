'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogTitle, Card, CardContent, CardActions, IconButton } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredInventory, setFilteredInventory] = useState([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [itemToUpdate, setItemToUpdate] = useState('')
  const [itemToRemove, setItemToRemove] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch and update the inventory
  const updateInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
      setFilteredInventory(inventoryList) // Initialize filtered inventory
    } catch (err) {
      setError('Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }

  // UseEffect to handle search filtering
  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    // Filter inventory based on the search term
    const result = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredInventory(result)
  }, [searchTerm, inventory])

  // Add item to inventory
  const addItem = async () => {
    if (!itemName.trim() || isNaN(itemQuantity) || itemQuantity <= 0) return
    setLoading(true)
    setError(null)
    try {
      const normalizedItemName = itemName.trim().toLowerCase()
      const docRef = doc(collection(firestore, 'inventory'), normalizedItemName)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + parseInt(itemQuantity) })
      } else {
        await setDoc(docRef, { quantity: parseInt(itemQuantity) })
      }
      await updateInventory() // Refresh inventory to include new item
    } catch (err) {
      setError('Failed to add item')
    } finally {
      setLoading(false)
      handleCloseAdd()
    }
  }

  // Update item in inventory
  const updateItem = async () => {
    if (!itemToUpdate.trim() || isNaN(itemQuantity) || itemQuantity <= 0) return
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(collection(firestore, 'inventory'), itemToUpdate.trim().toLowerCase())
      await setDoc(docRef, { quantity: parseInt(itemQuantity) })
      await updateInventory() // Refresh inventory to reflect update
    } catch (err) {
      setError('Failed to update item')
    } finally {
      setLoading(false)
      handleCloseUpdate()
    }
  }

  // Remove item from inventory
  const removeItem = async () => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(collection(firestore, 'inventory'), itemToRemove.trim().toLowerCase())
      await deleteDoc(docRef)
      await updateInventory() // Refresh inventory to remove deleted item
    } catch (err) {
      setError('Failed to remove item')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const handleOpenAdd = () => setOpenAdd(true)
  const handleCloseAdd = () => {
    setOpenAdd(false)
    setItemName('')
    setItemQuantity('')
  }
  
  const handleOpenUpdate = (item) => {
    setItemToUpdate(item.name)
    setItemQuantity(item.quantity)
    setOpenUpdate(true)
  }
  const handleCloseUpdate = () => {
    setOpenUpdate(false)
    setItemToUpdate('')
    setItemQuantity('')
  }
  
  const handleConfirmOpen = (item) => {
    setItemToRemove(item)
    setConfirmOpen(true)
  }
  const handleConfirmClose = () => setConfirmOpen(false)

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      padding={2}
    >
      {/* Header Section */}
      <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" padding={2}>
        <Typography variant="h4">Pantry Inventory</Typography>
        <TextField
          id="search"
          label="Search Inventory"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '300px' }}
          InputProps={{
            endAdornment: <SearchIcon />
          }}
        />
      </Box>

      {/* Add Item Modal */}
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="item-quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={addItem}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Item'}
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Modal>

      {/* Update Item Modal */}
      <Modal
        open={openUpdate}
        onClose={handleCloseUpdate}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="update-item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemToUpdate}
              disabled
            />
            <TextField
              id="update-item-quantity"
              label="Quantity"
              type="number"
              variant="outlined"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={updateItem}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Item'}
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button
            onClick={removeItem}
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Display */}
      <Stack width="100%" maxWidth="1200px" spacing={2} alignItems="center">
        {filteredInventory.length === 0 ? (
          <Typography variant="h6">No items found</Typography>
        ) : (
          filteredInventory.map(({ name, quantity }) => (
            <Card key={name} sx={cardStyle} elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body1">
                  Quantity: {quantity}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenUpdate({ name, quantity })}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleConfirmOpen(name)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))
        )}
      </Stack>

      <Button
        variant="contained"
        color="success"
        onClick={handleOpenAdd}
        startIcon={<AddIcon />}
        sx={{ mt: 2 }}
      >
        Add New Item
      </Button>
    </Box>
  )
}


    